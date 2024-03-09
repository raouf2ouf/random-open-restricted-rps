// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import {Test, console2} from "forge-std/Test.sol";
import {RestrictedRPSDeploy} from "../../script/RestrictedRPS.s.sol";
import {RestrictedRPSFactory} from "../../src/RestrictedRPSFactory.sol";
import {RestrictedRPSGame} from "../../src/RestrictedRPSGame.sol";
import {TestUtils} from "./Utils.t.sol";

contract RestrictedRPS_GameCreationTest is TestUtils {
    ///////////////////
    // Events
    ///////////////////

    //////////////////
    // Game Create
    //////////////////
    function test_GameCreation() public {
        uint8 duration = 1;
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(gameId)
        );

        (,,,,uint256 end,,) = game.getGameInfo();

        assert(game.getState() == RestrictedRPSGame.GameState.OPEN);
        assert(game.getDealer() == DEALER);
        assert(game.getDuration() == duration);
        assert(
            end > block.timestamp &&
                end <= (block.timestamp + (duration * 1 days))
        );
    }

    function test_GameCreationWithInsufficiantFunds() public {
        uint8 duration = 1;
        vm.expectRevert(
            RestrictedRPSFactory.RestrictedRPSFactory_SendMore.selector
        );
        createGame(duration, 0);
    }

    function test_GameCreationWithTooManyOpenGames() public {
        uint8 duration = 1;
        for (uint8 i; i < NBR_GAMES; i++) {
            createGame(duration, GAME_CREATION_FEE);
        }
        vm.expectRevert(
            RestrictedRPSFactory.RestrictedRPSFactory_TooManyOpenGames.selector
        );
        createGame(duration, GAME_CREATION_FEE);
    }


    function test_GameCreationWithReset() public {
        uint8 duration = 1;
        for (uint8 i; i < NBR_GAMES; i++) {
            createGame(duration, GAME_CREATION_FEE);
        }

        // close first game
        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(0)
        );
        vm.warp(block.timestamp + 3 days);
        game.finishGame();
        game.computeRewards();
        game.closeGame();

        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);
        assert(gameId == NBR_GAMES);
    }

    // //////////////////
    // // Game Joining
    // //////////////////
    function test_JoiningGame() public playersFunded(1) {
        uint8 duration = 1;
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(gameId)
        );

        address player = PLAYERS[0];
        uint256 amount = game.getBasicJoiningCost();
        vm.startPrank(player);
        uint8 playerId = game.joinGame{value: amount}();
        vm.stopPrank();

        RestrictedRPSGame.PlayerState memory playerState = game.getPlayerState(
            playerId
        );

        assert(playerState.player == player);
        assert(playerState.nbrStars == NBR_STARS);
        assert(playerState.nbrStarsLocked == 0);
        assert(playerState.nbrRocks == 0);
        assert(playerState.nbrPapers == 0);
        assert(playerState.nbrScissors == 0);
        assert(playerState.paidAmount == amount);
        assert(playerState.cardsGiven == false);
        assert(playerState.cheated == false);
    }

    function test_JoiningGameWithInsufficiantFunds() public playersFunded(1) {
        uint8 duration = 1;
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(gameId)
        );

        address player = PLAYERS[0];
        vm.expectRevert(RestrictedRPSGame.SendMore.selector);
        vm.prank(player);
        game.joinGame{value: 1}();
    }

    function test_JoiningAFullGame() public playersFunded(21) {
        uint8 duration = 1;
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(gameId)
        );

        uint256 joiningCost = game.getBasicJoiningCost();

        for (uint8 i; i < 20; i++) {
            vm.prank(PLAYERS[i]);
            game.joinGame{value: joiningCost}();
        }

        vm.expectRevert(RestrictedRPSGame.GameFull.selector);
        vm.prank(PLAYERS[20]);
        game.joinGame{value: joiningCost}();
    }

    function test_JoiningANonOpenGame() public playersFunded(1) {
        uint8 duration = 1;
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(gameId)
        );
        address player = PLAYERS[0];
        uint256 joiningCost = game.getBasicJoiningCost();
        vm.warp(block.timestamp + 3 days);

        game.finishGame();

        vm.expectRevert(RestrictedRPSGame.GameNotOpen.selector);
        vm.startPrank(player);
        game.joinGame{value: joiningCost}();
        vm.stopPrank();

        game.computeRewards();
        vm.expectRevert(RestrictedRPSGame.GameNotOpen.selector);
        vm.startPrank(player);
        game.joinGame{value: joiningCost}();
        vm.stopPrank();

        game.closeGame();
        vm.expectRevert(RestrictedRPSGame.GameNotOpen.selector);
        vm.startPrank(player);
        game.joinGame{value: joiningCost}();
        vm.stopPrank();
    }

    function test_DealerJoining() public playersFunded(1) {
        uint8 duration = 1;
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        RestrictedRPSGame game = RestrictedRPSGame(
            restrictedRPSFactory.getGame(gameId)
        );
        uint256 joiningCost = game.getBasicJoiningCost();

        vm.expectRevert(
            RestrictedRPSGame.DealerCannotJoin.selector
        );
        vm.prank(DEALER);
        game.joinGame{value: joiningCost}();
    }

    function test_JoiningTwiceSameGame() public playersFunded(7) {
        RestrictedRPSGame game = createGameWithPlayers(4, 1);
        uint256 joiningCost = game.getBasicJoiningCost();

        vm.expectRevert(
            RestrictedRPSGame.PlayerAlreadyJoined.selector
        );
        vm.prank(PLAYERS[2]);
        game.joinGame{value: joiningCost}();
    }
}
