// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {RestrictedRPSFactory} from "./RestrictedRPSFactory.sol";

/*
 * @title RestrictedRPS
 * @author raouf2ouf
 * @notice This contract handles games (matches) in the RestrictedRPS game
 */
contract RestrictedRPSGame {
    ///////////////////
    // Types
    ///////////////////
    struct PlayerState {
        uint256 paidAmount;
        uint256 rewards;
        uint256 amountToPay;
        address player;
        uint8 nbrStars;
        uint8 nbrStarsLocked;
        uint8 nbrOfferedMatches;
        int8 nbrRocks;
        int8 nbrPapers;
        int8 nbrScissors;
        bool cardsGiven;
        bool cheated;
    }

    struct Match {
        uint8 realPlayer1Id;
        uint8 realPlayer2Id;
        Card player1Card;
        Card player2Card;
        uint8 player1Bet;
        uint8 player2Bet;
        MatchState result;
        bytes32 player1Hash;
    }

    enum GameState {
        OPEN,
        FINISHED,
        COMPUTED_REWARDS,
        CLOSED
    }

    enum MatchState {
        UNDECIDED,
        ANSWERED,
        CANCELLED,
        DRAW,
        WIN1, // win for player 1
        WIN2 // win for player 2
    }

    enum Card {
        ROCK,
        PAPER,
        SCISSORS
    }

    ///////////////////
    // State
    ///////////////////

    // Constants
    uint8 private constant _CARDS_PER_PLAYER = 6;
    uint8 private constant _MAX_PLAYERS = 20;
    uint8 private constant _NBR_STARS = 3;
    uint8 private constant _MAX_OFFERED_MATCHES_PER_PLAYER = 20;
    uint16 private constant _MAX_OFFERED_MATCHES = 400; //uint16(_MAX_OFFERED_MATCHES_PER_PLAYER) * uint16(_MAX_PLAYERS);

    uint8 private constant _NBR_CARD_PER_TYPE_PER_GAME = 40;

    // Immutables
    RestrictedRPSFactory private immutable _factory;

    // State
    uint256 private _gameId;

    uint8 private _winningsCut;
    uint8[3] private _cards;
    uint256 private _starCost;
    uint256 private _m1CashCost;

    address private _dealer;
    uint256 private _endTimestamp;
    uint8 private _duration;
    uint8 private _nbrPlayers;
    GameState private _state;
    PlayerState[_MAX_PLAYERS] _players;

    uint16 private _nbrMatches;
    Match[_MAX_OFFERED_MATCHES] private _matches;
    mapping(address playerAddress => uint8 playerId) private _playerAddressToId;

    ///////////////////
    // Events
    ///////////////////
    event GameJoined(uint8 indexed playerId, address indexed player);

    event MatchCreated(uint256 indexed matchId, address indexed player);
    event MatchAnswered(uint256 indexed matchId, address indexed player);
    event MatchCancelled(uint256 indexed matchId, address indexed player);
    event MatchClosed(uint256 indexed matchId);

    event PlayerCheated(uint8 indexed playerId, address indexed player);
    event PlayerWasGivenCards(uint8 indexed playerId);

    event GameClosed();
    event ComputedRewards();

    ///////////////////
    // Errors
    ///////////////////
    error OnlyFactory();

    error GameNotOpen();
    error GameNotClosed();
    error GameNotFinished();
    error GameFull();
    error CannotResetOpenGame();

    error SendMore();

    error OnlyDealer();
    error DealerCannotJoin();

    error PlayerAlreadyJoined();
    error PlayerBanned();
    error InvalidPlayerId();
    error NotAPlayer();
    error NotTheRightPlayer();

    error InvalidMatchId();
    error MatchAlreadyPlayed();
    error MatchNotAnswered();
    error AnsweredMatchCannotBeCancelled();
    error WrongCardHash();
    error PlayerHasOfferedTooManyMatches();
    error NotEnoughAvailableStars();
    error CannotAnswerYourOwnMatch();

    error GameNotClosable();

    ///////////////////
    // Constructor
    ///////////////////
    constructor(
        address factory,
        uint256 gameId,
        uint8 winningsCut,
        uint256 starCost,
        uint256 m1CashCost,
        address dealer,
        uint8 duration
    ) {
        _factory = RestrictedRPSFactory(factory);
        _setGame(
            gameId,
            winningsCut,
            starCost,
            m1CashCost,
            dealer,
            duration
        );
    }

    ///////////////////
    // Modifiers
    ///////////////////
    modifier isNotBanned() {
        if (_factory.isBanned(msg.sender)) {
            revert PlayerBanned();
        }
        _;
    }
    modifier onlyDealer() {
        if (_dealer != msg.sender) {
            revert OnlyDealer();
        }
        _;
    }

    modifier onlyFactory() {
        if (msg.sender != address(_factory)) {
            revert OnlyFactory();
        }
        _;
    }

    modifier isValidPlayerId(uint8 playerId) {
        if (playerId == 0 || playerId > _nbrPlayers) {
            revert InvalidPlayerId();
        }
        _;
    }

    modifier isValidMatchId(uint16 matchId) {
        if (matchId >= _nbrMatches) {
            revert InvalidMatchId();
        }
        _;
    }

    modifier isClosed() {
        if (_state != GameState.CLOSED) {
            revert GameNotClosed();
        }
        _;
    }

    ///////////////////
    // Getters
    ///////////////////
    function getGameId() external view returns (uint256) {
        return _gameId;
    }

    function getState() external view returns (GameState) {
        return _state;
    }

    function getDealer() external view returns (address) {
        return _dealer;
    }

    function getDuration() external view returns (uint8) {
        return _duration;
    }

    function getNbrPlayers() external view returns (uint8) {
        return _nbrPlayers;
    }

    function getBasicJoiningCost() public view returns (uint256) {
        return (_starCost * _NBR_STARS);
    }

    function getStarCost() public view returns (uint256) {
        return _starCost;
    }

    function getPlayerState(
        uint8 playerId
    ) public view isValidPlayerId(playerId) returns (PlayerState memory) {
        uint8 realPlayerId = playerId - 1;
        return _players[realPlayerId];
    }

    function getPlayersState() external view returns (PlayerState[] memory) {
        uint8 nbrPlayers = _nbrPlayers;
        PlayerState[] memory playersStates = new PlayerState[](nbrPlayers);
        for (uint8 i; i < nbrPlayers; i++) {
            playersStates[i] = _players[i];
        }
        return playersStates;
    }

    function getMatches() external view returns (Match[] memory) {
        uint16 nbrMatches = _nbrMatches;
        Match[] memory matches = new Match[](nbrMatches);
        for (uint8 i; i < nbrMatches; i++) {
            matches[i] = _matches[i];
        }
        return matches;
    }

    function getGameInfo()
        public
        view
        returns (
            uint256, // gameId
            uint16, // nbrMatches
            uint256, // starCost
            uint256, // m1CashCost
            uint256, // endTimestamp
            uint8[3] memory, // cards
            address[] memory
        )
    {
        uint8 nbrPlayers = _nbrPlayers;
        address[] memory players = new address[](nbrPlayers);
        for (uint8 i; i < nbrPlayers; i++) {
            players[i] = _players[i].player;
        }
        return (
            _gameId,
            _nbrMatches,
            _starCost,
            _m1CashCost,
            _endTimestamp,
            _cards,
            players
        );
    }

    ///////////////////
    // Private Functions
    ///////////////////
    function _setGame(
        uint256 gameId,
        uint8 winningsCut,
        uint256 starCost,
        uint256 m1CashCost,
        address dealer,
        uint8 duration
    ) private {
        _gameId = gameId;
        _winningsCut = winningsCut;
        _starCost = starCost;
        _m1CashCost = m1CashCost;
        _dealer = dealer;
        _duration = duration;
        _state = GameState.OPEN;
        _endTimestamp = block.timestamp + (duration * 1 days);
        uint8 initialNbrCards = (_CARDS_PER_PLAYER / 3) * _MAX_PLAYERS;
        _cards = [initialNbrCards, initialNbrCards, initialNbrCards];
    }

    function _playCard(uint8 realPlayerId, Card card) private {
        if (card == Card.ROCK) {
            _players[realPlayerId].nbrRocks--;
        } else if (card == Card.PAPER) {
            _players[realPlayerId].nbrPapers--;
        } else if (card == Card.SCISSORS) {
            _players[realPlayerId].nbrScissors--;
        }
    }

    function _markAsDraw(
        uint16 matchId
    ) private {
        Match memory m = _matches[matchId];
        uint8 realPlayer1Id = m.realPlayer1Id;
        uint8 realPlayer2Id = m.realPlayer2Id;
        _matches[matchId].result = MatchState.DRAW;
        _players[realPlayer1Id].nbrStarsLocked -= m.player1Bet;
        _players[realPlayer2Id].nbrStarsLocked -= m.player2Bet;
    }

    function _markAsPlayer1Win(
        uint16 matchId
    ) private {
        Match memory m = _matches[matchId];
        uint8 realPlayer1Id = m.realPlayer1Id;
        uint8 realPlayer2Id = m.realPlayer2Id;
        _matches[matchId].result = MatchState.WIN1;
        _players[realPlayer1Id].nbrStarsLocked -= m.player1Bet;
        _players[realPlayer1Id].nbrStars += m.player2Bet;
        _players[realPlayer2Id].nbrStarsLocked -= m.player2Bet;
        _players[realPlayer2Id].nbrStars -= m.player2Bet;
    }

    function _markAsPlayer2Win(
        uint16 matchId
    ) private {
        Match memory m = _matches[matchId];
        uint8 realPlayer1Id = m.realPlayer1Id;
        uint8 realPlayer2Id = m.realPlayer2Id;
        _matches[matchId].result = MatchState.WIN2;
        _players[realPlayer1Id].nbrStarsLocked -= m.player1Bet;
        _players[realPlayer1Id].nbrStars -= m.player1Bet;
        _players[realPlayer2Id].nbrStarsLocked -= m.player2Bet;
        _players[realPlayer2Id].nbrStars += m.player1Bet;
    }

    function _closeUnclosedMatches() private {
        uint16 nbrMatches = _nbrMatches;
        for(uint16 i; i < nbrMatches; i++) {
            if(_matches[i].result == MatchState.ANSWERED) {
                _markAsPlayer2Win(i);
                emit MatchClosed(i);
            }
        }
    }

    function _payPlayersTheirCollateral() private {
        uint8 nbrPlayers = _nbrPlayers;
        for (uint8 i; i < nbrPlayers; i++) {
            _players[i].amountToPay = _players[i].paidAmount;
        }
    }

    function _computeRewardsForPlayer(
        int8 nbrCards,
        uint8 nbrStars
    ) private view returns (uint256 payout) {
        if (nbrCards < 0) {
            return 0;
        }
        if (nbrCards != 0) {
            // player still has cards, limit payout to 4
            if (nbrStars > 4) {
                nbrStars = 4;
            }
        }
        uint256 pay = nbrStars * _starCost;
        payout = (pay * (1000 - _winningsCut)) / 1000;
    }

    ///////////////////
    // External Functions
    ///////////////////
    function resetGame(
        uint256 gameId,
        uint8 winningsCut,
        uint256 starCost,
        uint256 m1CashCost,
        address dealer,
        uint8 duration
    ) external onlyFactory {
        if (_state != GameState.CLOSED) {
            revert CannotResetOpenGame();
        }
        _nbrMatches = 0;
        delete _matches;
        uint8 nbrPlayers = _nbrPlayers;
        for(uint8 i; i < nbrPlayers; i++) {
            address playerAddess = _players[i].player;
            delete _playerAddressToId[playerAddess];
        }
        _nbrPlayers = 0;
        delete _players;
        _setGame(
            gameId,
            winningsCut,
            starCost,
            m1CashCost,
            dealer,
            duration
        );
    }

    /*
     * @param _initialHash: The hash of the initial shuffle of the deck
     */
    function joinGame() external payable isNotBanned returns (uint8 playerId) {
        address player = msg.sender;
        if (msg.value < getBasicJoiningCost()) {
            revert SendMore();
        }
        if (_state != GameState.OPEN) {
            revert GameNotOpen();
        }
        if (_dealer == player) {
            revert DealerCannotJoin();
        }

        // Make sure he has not already joined
        if(_playerAddressToId[player] != 0) {
            revert PlayerAlreadyJoined();
        }

        uint8 realPlayerId = _nbrPlayers;
        playerId = realPlayerId + 1;
        if (playerId > _MAX_PLAYERS) {
            revert GameFull();
        }


        _playerAddressToId[player] = playerId;
        PlayerState memory playerState;
        playerState.player = player;
        playerState.nbrStars = _NBR_STARS;
        playerState.paidAmount = msg.value;

        // Join game
        _players[realPlayerId] = playerState;
        _nbrPlayers++;

        _factory.requestRng(_gameId, playerId);

        emit GameJoined(playerId, player);
    }

    function offerMatch(
        bytes32 hashedCard,
        uint8 player1Bet,
        uint8 player2Bet
    ) external returns (uint16 matchId) {
        Match memory m;
        uint8 playerId = _playerAddressToId[msg.sender];
        if (playerId == 0) {
            revert NotAPlayer();
        }
        uint8 realPlayerId = playerId - 1; 

        PlayerState memory player1State = _players[realPlayerId];

        uint8 nbrOfferedMatches = player1State.nbrOfferedMatches + 1;
        if (nbrOfferedMatches > _MAX_OFFERED_MATCHES_PER_PLAYER) {
            revert PlayerHasOfferedTooManyMatches();
        }

        if (
            (player1Bet + player1State.nbrStarsLocked) > (player1State.nbrStars)
        ) {
            revert NotEnoughAvailableStars();
        }

        m.realPlayer1Id = realPlayerId;
        m.player1Hash = hashedCard;
        m.player2Bet = player2Bet;
        m.player1Bet = player1Bet;
        matchId = _nbrMatches;
        _matches[matchId] = m;
        _nbrMatches++;

        _players[realPlayerId].nbrOfferedMatches = nbrOfferedMatches;
        _players[realPlayerId].nbrStarsLocked += player1Bet;

        emit MatchCreated(matchId, msg.sender);
    }

    function cancelMatch(uint16 matchId) external isValidMatchId(matchId) {
        Match memory m = _matches[matchId];
        uint8 playerId = _playerAddressToId[msg.sender];
        if (m.realPlayer1Id != (playerId - 1)) {
            revert NotTheRightPlayer();
        }
        MatchState result = m.result;
        if (result != MatchState.UNDECIDED) {
            revert AnsweredMatchCannotBeCancelled();
        }
        _players[m.realPlayer1Id].nbrStarsLocked -= m.player1Bet;
        _matches[matchId].result = MatchState.CANCELLED;

        emit MatchCancelled(matchId, msg.sender);
    }

    function answerMatch(
        uint16 matchId,
        Card card
    ) external isValidMatchId(matchId) {
        uint8 playerId = _playerAddressToId[msg.sender];
        if (playerId == 0) {
            revert NotAPlayer();
        }
        uint8 realPlayerId = playerId - 1;
        Match storage m = _matches[matchId];
        if (realPlayerId == m.realPlayer1Id) {
            revert CannotAnswerYourOwnMatch();
        }
        if (m.result != MatchState.UNDECIDED) {
            revert MatchAlreadyPlayed();
        }
        PlayerState memory player2State = _players[realPlayerId];

        if (
            (m.player2Bet + player2State.nbrStarsLocked) >
            (player2State.nbrStars)
        ) {
            revert NotEnoughAvailableStars();
        }
        m.realPlayer2Id = realPlayerId;
        m.player2Card = card;
        m.result = MatchState.ANSWERED;
        _players[realPlayerId].nbrStarsLocked += m.player2Bet;
        emit MatchAnswered(matchId, msg.sender);
    }

    function closeMatch(
        uint16 matchId,
        uint8 card,
        string memory secret
    ) external isValidMatchId(matchId) {
        Match memory m = _matches[matchId];
        if (m.result != MatchState.ANSWERED) {
            revert MatchNotAnswered();
        }
        bytes32 cardHash = keccak256(bytes.concat(bytes1(card), bytes(secret)));
        if (m.player1Hash != cardHash) {
            revert WrongCardHash();
        }

        Card player1Card = Card(card);
        _matches[matchId].player1Card = player1Card;
        Card player2Card = m.player2Card;

        _playCard(m.realPlayer1Id, player1Card);
        _playCard(m.realPlayer2Id, player2Card);

        if (uint8(player1Card) > 2) {
            // player 1 played invalid card. Player 2 wins
            _markAsPlayer2Win(matchId);
        }
        if (uint8(player2Card) > 2) {
            // player 2 played invalid card. Player 1 wins
            _markAsPlayer1Win(matchId);
        }

        if (player1Card == player2Card) {
            // Draw
            _markAsDraw(matchId);
        } else if (
            (player1Card == Card.ROCK && player2Card == Card.SCISSORS) ||
            (player1Card == Card.PAPER && player2Card == Card.ROCK) ||
            (player1Card == Card.SCISSORS && player2Card == Card.PAPER)
        ) {
            _markAsPlayer1Win(matchId);
        } else {
            _markAsPlayer2Win(matchId);
        }

        emit MatchClosed(matchId);
    }

    function givePlayerHand(uint8 playerId, uint8[6] memory rng) external isValidPlayerId(playerId) onlyFactory {
        uint8[8] memory deck;
        uint8[3] memory playerCards;
        uint8[3] memory cards = _cards;
        uint8 nbrCards;
        uint8 cardType;
        bool[3] memory empty;
        while(nbrCards < 8 && (!empty[0] || !empty[1] || !empty[2])) {
            if(cards[cardType] > 0) {
                deck[nbrCards] = cardType;
                nbrCards++;
                cards[cardType]--;
            } else {
                empty[cardType] = true;
            }
            cardType = (cardType + 1) % 3;
        }

        for(uint8 i; i < 6; i++) {
            uint8 randIdx = rng[i] % nbrCards;
            cardType = deck[randIdx];
            playerCards[cardType]++;

            deck[randIdx] = deck[nbrCards - 1];
            nbrCards--;
        }
        
        uint8 realPlayerId;
        unchecked {
            realPlayerId = playerId - 1;
            _cards[0] -= playerCards[0];
            _cards[1] -= playerCards[1];
            _cards[2] -= playerCards[2];
        }
        _players[realPlayerId].nbrRocks = int8(playerCards[uint8(Card.ROCK)]);
        _players[realPlayerId].nbrPapers = int8(playerCards[uint8(Card.PAPER)]);
        _players[realPlayerId].nbrScissors = int8(playerCards[uint8(Card.SCISSORS)]);
        _players[realPlayerId].cardsGiven = true;

        emit PlayerWasGivenCards(playerId);
    }

    function isFinished() public view returns (bool) {
        if (_state != GameState.OPEN) {
            return false;
        }
        if (_endTimestamp > block.timestamp) {
            if (_nbrPlayers == 20) {
                PlayerState[20] memory players = _players;
                bool finished = true;
                for (uint8 i; i < 20; i++) {
                    if(!players[i].cardsGiven) {
                        finished = false;
                        break;
                    } else if((players[i].nbrRocks + players[i].nbrPapers + players[i].nbrScissors) > 0) {
                        //there is still players with cards
                        finished = false;
                        break;
                    }
                }
                return finished;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    function finishGame() external {
        if(!isFinished()) {
            revert GameNotFinished();
        }
        _closeUnclosedMatches();
        _state = GameState.FINISHED;
    }

    function computeRewards() external {
        if (_state != GameState.FINISHED) {
            revert GameNotFinished();
        }
        uint8 nbrPlayers = _nbrPlayers;
        uint8 nbrPlayersWhoCheated;
        for (uint8 i; i < nbrPlayers; i++) {
            PlayerState memory playerState = _players[i];
            if (
                (playerState.nbrRocks < 0 ) ||
                (playerState.nbrPapers < 0 ) ||
                (playerState.nbrScissors < 0)
            ) {
                emit PlayerCheated(i+1, playerState.player);
                nbrPlayersWhoCheated++;
                _players[i].cheated = true;
            } else {
                uint256 rewards = _computeRewardsForPlayer(
                    playerState.nbrRocks + playerState.nbrPapers + playerState.nbrScissors,
                    playerState.nbrStars
                );
                _players[i].rewards = rewards;
                _players[i].amountToPay = rewards;
            }
        }
        if (nbrPlayersWhoCheated > 0) {
            // some players have cheated, give everyone his collateral back plus extra
            uint256 extra = (nbrPlayersWhoCheated * _starCost * 3) / ((nbrPlayers - nbrPlayersWhoCheated) + 1);
            for (uint8 i; i < nbrPlayers; i++) {
                PlayerState memory playerState = _players[i];
                if (!playerState.cheated) {
                    uint256 rewards = playerState.paidAmount + extra;
                    _players[i].rewards = rewards;
                    _players[i].amountToPay = rewards;
                }
            }
        }
        _state = GameState.COMPUTED_REWARDS;
        emit ComputedRewards();
    }

    function closeGame() external {
        if(_state != GameState.COMPUTED_REWARDS) {
            revert GameNotClosable();
        }
        uint8 nbrPlayers = _nbrPlayers;
        for (uint8 i; i < nbrPlayers; i++) {
            PlayerState memory st = _players[i];
            uint256 amount = st.amountToPay;
            address playerAddress = st.player;
            if (amount > 0) {
                _players[i].amountToPay = 0;
                payable(playerAddress).transfer(amount);
            } else if(st.cheated) {
                _factory.banFromGame(_gameId, st.player);
            }
        }
        _state = GameState.CLOSED;
    }

    function withdraw() external isClosed onlyFactory {
        payable(address(_factory)).transfer(address(this).balance);
    }
}
