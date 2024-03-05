// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import {Test, console2} from "forge-std/Test.sol";
import {RestrictedRPSDeploy} from "../../script/RestrictedRPS.s.sol";
import {RestrictedRPSFactory} from "../../src/RestrictedRPSFactory.sol";
import {RestrictedRPSGame} from "../../src/RestrictedRPSGame.sol";

contract TestUtils is Test {
    RestrictedRPSFactory public restrictedRPSFactory;

    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    uint256 public constant GAME_CREATION_FEE = 1;
    uint8 public constant NBR_GAMES = 20;
    uint8 public constant NBR_STARS = 3;

    address public DEALER = makeAddr("dealer");
    address[] public PLAYERS = [
        makeAddr("player1"),
        makeAddr("player2"),
        makeAddr("player3"),
        makeAddr("player4"),
        makeAddr("player5"),
        makeAddr("player6"),
        makeAddr("player7"),
        makeAddr("player8"),
        makeAddr("player9"),
        makeAddr("player10"),
        makeAddr("player11"),
        makeAddr("player12"),
        makeAddr("player13"),
        makeAddr("player14"),
        makeAddr("player15"),
        makeAddr("player16"),
        makeAddr("player17"),
        makeAddr("player18"),
        makeAddr("player19"),
        makeAddr("player20"),
        makeAddr("player21")
    ];

    function setUp() public {
        RestrictedRPSDeploy restrictedRPSScript = new RestrictedRPSDeploy();
        restrictedRPSFactory = restrictedRPSScript.run();
    }

    modifier dealerFunded() {
        vm.deal(DEALER, STARTING_USER_BALANCE);
        _;
    }

    modifier playersFunded(uint8 nbrPlayers) {
        for (uint8 i; i < nbrPlayers; i++) {
            vm.deal(PLAYERS[i], STARTING_USER_BALANCE);
        }
        _;
    }

    function createGame(
        uint8 duration,
        uint256 fee
    ) public dealerFunded returns (uint256 gameId, address gameAddress) {
        vm.prank(DEALER);
        (gameId, gameAddress) = restrictedRPSFactory.createGame{value: fee}(
            duration
        );
    }

    function createGameWithPlayers(
        uint8 nbrPlayers,
        uint8 duration
    ) public playersFunded(nbrPlayers) returns (RestrictedRPSGame game) {
        uint256[6] memory rng = [uint256(0x1), 0x2, 0x3, 0x4, 0x5, 0x6];
        game = createGameWithPlayersGivenSeed(nbrPlayers, duration, rng);
    }

    function createGameWithPlayersGivenSeed(uint8 nbrPlayers, uint8 duration, uint256[6] memory rng) public playersFunded(nbrPlayers) returns (RestrictedRPSGame game) {
        (uint256 gameId, ) = createGame(duration, GAME_CREATION_FEE);

        game = RestrictedRPSGame(restrictedRPSFactory.getGame(gameId));
        uint256 joiningCost = game.getBasicJoiningCost();

        for (uint8 i; i < nbrPlayers; i++) {
            vm.prank(PLAYERS[i]);
            game.joinGame{value: joiningCost}();

            // (,,,,, uint8[3] memory cards, ) = game.getGameInfo();
            // console2.log("cards: %s R| %s P| %s S", cards[0], cards[1], cards[2]);
            vm.prank(DEALER);
            game.givePlayerHand(i+1, rng);
            // RestrictedRPSGame.PlayerState memory st = game.getPlayerState(i+1);
            // console2.log("cards of player: %s R | %s P | %s S", uint8(st.nbrRocks), uint8(st.nbrPapers), uint8(st.nbrScissors));
        }

    }


    function hashCard(
        uint8 card,
        string memory secret
    ) public pure returns (bytes32) {
        return keccak256(bytes.concat(bytes1(card), bytes(secret)));
    }

    function getRandomPlayerCard(RestrictedRPSGame game, uint8 p) public view returns (uint8) {
        RestrictedRPSGame.PlayerState memory st = game.getPlayerState(p+1);
        bool noCard = true;
        uint8 card = restrictedRPSFactory.generateRandomNumberFromSeed(block.timestamp, 2); // 0 to 2;
        require(st.nbrRocks > 0 || st.nbrScissors > 0 || st.nbrPapers > 0, "Player has no cards left!");
        while(noCard) {
            if(card == uint8(RestrictedRPSGame.Card.ROCK) && st.nbrRocks > 0) {
                noCard = false;
            } else if (card == uint8(RestrictedRPSGame.Card.PAPER) && st.nbrPapers > 0) {
                noCard = false;
            } else if (card == uint8(RestrictedRPSGame.Card.SCISSORS) && st.nbrScissors > 0) {
                noCard = false;
            } else {
                card = (card + 1) % 3;
            }
        }
        return card;
    }

    function offerMatch(
        RestrictedRPSGame game,
        address player,
        uint8 card,
        string memory secret,
        uint8 player1Bet,
        uint8 player2Bet
    ) public returns (uint16 matchId, bytes32 hashedCard) {
        // offer a match
        hashedCard = hashCard(card, secret);
        vm.prank(player);
        matchId = game.offerMatch(hashedCard, player1Bet, player2Bet);
    }

    function answerMatch(
        RestrictedRPSGame game,
        address player,
        uint16 matchId,
        uint8 card
    ) public  {
        vm.prank(player);
        game.answerMatch(matchId, RestrictedRPSGame.Card(card));
    }


    function offerAndAnswerAndCloseMatch(
        RestrictedRPSGame game,
        uint8 p1,
        uint8 p2,
        string memory secret,
        uint8 p1Bet,
        uint8 p2Bet
    ) public returns (uint16 matchId) {
        return offerAndAnswerAndCloseMatchGivenCards(game, p1, p2, getRandomPlayerCard(game, p1), getRandomPlayerCard(game, p2), secret, p1Bet, p2Bet);
    }
    function offerAndAnswerAndCloseMatchGivenCards(
        RestrictedRPSGame game,
        uint8 p1,
        uint8 p2,
        uint8 p1Card,
        uint8 p2Card,
        string memory secret,
        uint8 p1Bet,
        uint8 p2Bet
    ) public returns (uint16 matchId) {
        address player1 = PLAYERS[p1];
        address player2 = PLAYERS[p2];

        // offer match
        (uint16 mId, ) = offerMatch(game, player1, p1Card, secret, p1Bet, p2Bet);

        vm.prank(player2);
        game.answerMatch(mId, RestrictedRPSGame.Card(p2Card));

        vm.prank(player1);
        game.closeMatch(mId, p1Card, secret);
        return mId;
    }
}
