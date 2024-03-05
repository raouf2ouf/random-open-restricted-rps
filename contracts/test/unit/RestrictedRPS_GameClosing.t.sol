
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import {Test, console2} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {RestrictedRPSDeploy} from "../../script/RestrictedRPS.s.sol";
import {RestrictedRPSFactory} from "../../src/RestrictedRPSFactory.sol";
import {RestrictedRPSGame} from "../../src/RestrictedRPSGame.sol";
import {TestUtils} from "./Utils.t.sol";

contract RestrictedRPS_GameClosingTest is TestUtils {
    event PlayerCheated(uint8 indexed playerId, address indexed player);

    function test_GameClosingBeforeComputingRewards() public {
        // Create Valid Game
        uint8 duration = 1;
        RestrictedRPSGame game = createGameWithPlayers(2, duration);

        offerAndAnswerAndCloseMatch(game, 0, 1, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 0, 1, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 0, 1, "secret", 1, 1);

        offerAndAnswerAndCloseMatch(game, 1, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 1, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 1, 0, "secret", 1, 1);

        vm.expectRevert(
            RestrictedRPSGame.RestrictedRPS_GameNotClosable.selector
        );
        game.closeGame();
    }

    function test_GameClosingNotFullBeforeEnd() public {
        // Create Valid Game
        uint8 duration = 1;
        RestrictedRPSGame game = createGameWithPlayers(2, duration);

        offerAndAnswerAndCloseMatch(game, 0, 1, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 0, 1, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 0, 1, "secret", 1, 1);

        offerAndAnswerAndCloseMatch(game, 1, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 1, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 1, 0, "secret", 1, 1);

        (,,,,uint256 end,,) = game.getGameInfo(); 
        require(end > block.timestamp, "Game expired, not valid for this test");


        vm.expectRevert(
            RestrictedRPSGame.RestrictedRPS_GameNotFinished.selector
        );
        game.finishGame();

        vm.expectRevert(
            RestrictedRPSGame.RestrictedRPS_GameNotFinished.selector
        );
        game.computeRewards();
    }

    function test_GameClosingFullCompleteGameBeforeEnd() public {
        // Create Valid Game
        uint8 duration = 1;
        uint256[6] memory rng = [uint256(0x1), 0x2, 0x3, 0x4, 0x5, 0x6];
        RestrictedRPSGame game = createGameWithPlayersGivenSeed(20, duration, rng);

        uint256[20] memory balances;
        for(uint8 i; i < 20; i++) {
            balances[i] = PLAYERS[i].balance;
        }

        for(uint8 i; i < 12; i = i+2) {
            // ensure draws
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            // random winings
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
        }
        // ensure draws
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 0, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 2, 2, "secret", 1, 1);
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 2, 2, "secret", 1, 1);
        // random winings
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        for(uint8 i = 14; i < 20; i = i+2) {
            // ensure draws
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            // random winings
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
        }

        (,,,,uint256 end,,) = game.getGameInfo(); 
        require(end > block.timestamp, "Game expired, not valid for this test");
        game.finishGame();
        game.computeRewards();

        game.closeGame();

        uint256 starCost = game.getStarCost();
        for(uint8 i; i < 20; i++) {
            RestrictedRPSGame.PlayerState memory st = game.getPlayerState(i+1);
            // console2.log("cards of player: %s R | %s P | %s S", uint8(st.nbrRocks), uint8(st.nbrPapers), uint8(st.nbrScissors));
            assert((st.nbrRocks + st.nbrPapers + st.nbrScissors) == 0);
            uint256 w = st.nbrStars * starCost;
            w = (w * (1000 - 1)) / 1000;
            assert((balances[i] + w) == PLAYERS[i].balance);
        }
    }

    function test_GameClosingAfterPlayerCheated() public {
        // Create Valid Game
        uint8 duration = 1;
        uint256[6] memory rng = [uint256(0x1), 0x2, 0x3, 0x4, 0x5, 0x6];
        RestrictedRPSGame game = createGameWithPlayersGivenSeed(20, duration, rng);
        uint256 joiningCost = game.getBasicJoiningCost();

        uint256[20] memory balances;
        for(uint8 i; i < 20; i++) {
            balances[i] = PLAYERS[i].balance;
        }

        for(uint8 i; i < 12; i = i+2) {
            // ensure draws
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            // random winings
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
        }
        // ensure draws
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 0, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 2, 2, "secret", 1, 1);
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 2, 2, "secret", 1, 1);
        // Cheating
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 2, 2, "secret",  1, 1);
        // random winings
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        for(uint8 i = 14; i < 20; i = i+2) {
            // ensure draws
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            // random winings
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
        }

        (,,,,uint256 end,,) = game.getGameInfo(); 
        require(end > block.timestamp, "Game expired, not valid for this test");

        game.finishGame();

        vm.expectEmit(true, true, true, false);
        emit PlayerCheated(12+1, PLAYERS[12]);
        game.computeRewards();

        game.closeGame();



        uint256 starCost = game.getStarCost();
        uint256 extra = starCost * 3 / 20;
        console2.log("=========================================");
        for(uint8 i; i < 20; i++) {
            RestrictedRPSGame.PlayerState memory st = game.getPlayerState(i+1);
            if(i == 12) {
                assert(st.cheated == true);
                assert(balances[i] == PLAYERS[i].balance);
                assert(restrictedRPSFactory.isBanned(PLAYERS[12]) == true);
            } else {
                assert(st.cheated == false);
                assert((balances[i] + joiningCost + extra) == PLAYERS[i].balance);
                assert(restrictedRPSFactory.isBanned(PLAYERS[i]) == false);
            }
        }
    }


    function test_GameClosingWithAnsweredMatches() public {
        // Create Valid Game
        uint8 duration = 1;
        uint256[6] memory rng = [uint256(0x1), 0x2, 0x3, 0x4, 0x5, 0x6];
        RestrictedRPSGame game = createGameWithPlayersGivenSeed(20, duration, rng);

        uint256[20] memory balances;
        for(uint8 i; i < 20; i++) {
            balances[i] = PLAYERS[i].balance;
        }

        for(uint8 i; i < 12; i++) {
            // ensure draws
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 0, 0, "secret", 1, 1);
            // unclosed Games
            (uint16 matchId,) = offerMatch(game, PLAYERS[i], 0, "secret", 1, 1);
            answerMatch(game, PLAYERS[i+1], matchId, 0);
        }
        // ensure draws
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 0, 0, "secret", 1, 1);
        offerAndAnswerAndCloseMatchGivenCards(game, 12, 13, 2, 2, "secret", 1, 1);
        // random winings
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        offerAndAnswerAndCloseMatch(game, 12, 13, "secret", 1, 1);
        for(uint8 i = 14; i < 20; i = i+2) {
            // ensure draws
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            offerAndAnswerAndCloseMatchGivenCards(game, i, (i+1), 1, 1, "secret", 1, 1);
            // random winings
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
            offerAndAnswerAndCloseMatch(game, i, (i+1), "secret", 1, 1);
        }


        vm.warp(block.timestamp + (duration * 1 days) + 1000);
        (,,,,uint256 end,,) = game.getGameInfo(); 
        require(end < block.timestamp, "Game not expired, not valid for this test");

        game.finishGame();
        game.computeRewards();
        game.closeGame();

        uint256 starCost = game.getStarCost();
        for(uint8 i; i < 20; i++) {
            RestrictedRPSGame.PlayerState memory st = game.getPlayerState(i+1);
            // console2.log("Player %s: %s Stars", i, st.nbrStars);
            // console2.log("Player %s: %s R | %s P | %s S", uint8(st.nbrRocks), uint8(st.nbrPapers), uint8(st.nbrScissors));
            if(i == 0) {
                assert(st.nbrStars == 2);
            } else if(i < 13) {
                assert(st.nbrStars == 3);
            }
            assert(st.cheated == false);
            uint256 w = st.nbrStars * starCost;
            w = (w * (1000 - 1)) / 1000;
            // console2.log("%s | %s", (balances[i] + w), PLAYERS[i].balance);
            assert((balances[i] + w) == PLAYERS[i].balance);
        }
    }
}