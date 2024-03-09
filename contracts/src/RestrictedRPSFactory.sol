// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts-v4/access/Ownable.sol";
import {RestrictedRPSGame} from "./RestrictedRPSGame.sol";

/*
 * @title RestrictedRPS
 * @author raouf2ouf
 * @notice This contract handles games (matches) in the RestrictedRPS game
 */
contract RestrictedRPSFactory is Ownable {
    ///////////////////
    // Types
    ///////////////////

    ////////////////
    // State
    ////////////////
    uint8 private constant _NBR_GAMES = 20;
    uint8 private constant _MAX_DURATION = 74; // three days
    uint8 private constant _NBR_STARS = 3;

    uint8 private constant _CARDS_PER_PLAYER = 6;
    uint8 private constant _MAX_PLAYERS = 6;
    uint8 private constant _MAX_NBR_CARDS = _CARDS_PER_PLAYER * _MAX_PLAYERS;
    uint8 private constant _NBR_CARDS_PER_TYPE = _MAX_NBR_CARDS / 3;
    uint8 private constant _NBR_BITS_PER_CARD = 2;
    uint8 private constant _NBR_CARDS_PER_BYTE = 8 / _NBR_BITS_PER_CARD;

    uint256 private _gameCreationFee = 1; // 0
    uint8 private _winningsCut = 1; // per 1000
    uint256 private _starCost = 1e13; // 0.00001
    uint256 private _m1CachCost = 1e13; // 0.00001
    address private _rngProvider;

    /// @dev Mapping of banned players
    mapping(address player => bool banned) private _banned;

    /// @dev games (20 games history)
    address[_NBR_GAMES] private _games;
    uint256 private _lastGameId;

    uint16[] private _rngRequests;

    ////////////////
    // Events
    ////////////////
    event GameCreated(uint256 indexed gameId, address indexed gameAddress);
    event GameJoined(uint256 indexed gameId, address player);

    ////////////////
    // Errors
    ////////////////
    error RestrictedRPSFactory_InvalidGameId(uint256 gameId);
    error RestrictedRPSFactory_PlayerBanned(address player);
    error RestrictedRPSFactory_SendMore();
    error RestrictedRPSFactory_TooManyOpenGames();
    error RestrictedRPSFactory_DurationTooLong();
    error notRngProvider();
    error notExactNumberOfValues();

    ////////////////
    // Construcor
    ////////////////
    constructor() Ownable() {}

    ///////////////////
    // Modifiers
    ///////////////////
    modifier isValidGameId(uint256 gameId) {
        uint8 realGameId = getRealGameId(gameId);
        if (_games[realGameId] == address(0)) {
            revert RestrictedRPSFactory_InvalidGameId(gameId);
        }
        _;
    }
    modifier isNotBanned() {
        if (_banned[msg.sender]) {
            revert RestrictedRPSFactory_PlayerBanned(msg.sender);
        }
        _;
    }

    modifier onlyRngProvider() {
        if(msg.sender != _rngProvider) {
            revert notRngProvider();
        }
        _;
    }

    ////////////////
    // External
    ////////////////
    function setRngProvider(address provider) external onlyOwner() {
        _rngProvider = provider;
    }

    function requestRng(uint256 gameId, uint8 playerId) public {
        uint8 realGameId = getRealGameId(gameId); 
        if(msg.sender == _games[realGameId]) {
            uint16 packed = (uint16(realGameId) << 8) | uint16(playerId);
            _rngRequests.push(packed);
        }
    }

    function fullfillRngs(uint8[6][] calldata rng) external onlyRngProvider() {
        if(rng.length != _rngRequests.length) {
            revert notExactNumberOfValues();
        }
        for(uint16 i = 0; i < rng.length; i++) {
            uint16 packed = _rngRequests[i];
            uint8 realGameId = uint8(packed >> 8);
            uint8 playerId = uint8(packed);
            RestrictedRPSGame(_games[realGameId]).givePlayerHand(playerId, rng[i]);
        }
        delete _rngRequests;
    }

    function getRngRequests() external view returns (uint16[] memory) {
        return _rngRequests;
    }

    function givePlayersCards(address[] calldata games, uint8[] calldata playerIds, uint8[6][] calldata rng) external onlyRngProvider() {
        for(uint8 i = 0; i < games.length; i++) {
            RestrictedRPSGame(games[i]).givePlayerHand(playerIds[i], rng[i]);
        }
    }

    function getGame(uint256 gameId) external view returns (address) {
        uint8 realGameId = getRealGameId(gameId);
        return address(_games[realGameId]);
    }
    function getGames() external view returns (address[_NBR_GAMES] memory) {
        return _games;
    }
    function getOpenGames() public view returns (address[] memory) {
        address[] memory all = new address[](_NBR_GAMES);
        uint8 j;
        for (uint8 i; i < _NBR_GAMES; i++) {
            address adr = _games[i];
            if (adr != address(0)) {
                RestrictedRPSGame game = RestrictedRPSGame(adr);
                if (game.getState() == RestrictedRPSGame.GameState.OPEN) {
                    all[j] = adr;
                    j++;
                }
            }
        }
        address[] memory result = new address[](j);
        for (uint8 i; i < j; i++) {
            result[i] = all[i];
        }
        return result;
    }


    function isBanned(address user) external view returns (bool) {
        return _banned[user];
    }
    function ban(address user) external onlyOwner {
        _banned[user] = true;
    }

    function banFromGame(uint256 gameId, address player) external {
        uint8 realGameId = getRealGameId(gameId);
        if(msg.sender == _games[realGameId]) {
            _banned[player] = true;
        }
    }

    function unban(address user) external onlyOwner {
        _banned[user] = false;
    }

    function setGameCreationFee(uint256 gameCreationFee) external onlyOwner {
        _gameCreationFee = gameCreationFee;
    }

    function setWinningsCut(uint8 winningsCut) external onlyOwner {
        _winningsCut = winningsCut;
    }

    function setStarCost(uint256 starCost) external onlyOwner {
        _starCost = starCost;
    }

    function createGame(
        uint8 duration
    ) external payable isNotBanned returns (uint256 gameId, address gameAddress) {
        if (msg.value < _gameCreationFee) {
            revert RestrictedRPSFactory_SendMore();
        }
        gameId = _lastGameId;
        uint8 realGameId = getRealGameId(gameId);
        gameAddress = _games[realGameId];
        if (address(gameAddress) != address(0)) {
            RestrictedRPSGame game = RestrictedRPSGame(gameAddress);
            if (game.getState() != RestrictedRPSGame.GameState.CLOSED) {
                revert RestrictedRPSFactory_TooManyOpenGames();
            } else {
                game.resetGame(
                    gameId,
                    _winningsCut,
                    _starCost,
                    _m1CachCost,
                    msg.sender,
                    duration
                );
            }
        } else {
            RestrictedRPSGame game = new RestrictedRPSGame(
                address(this),
                gameId,
                _winningsCut,
                _starCost,
                _m1CachCost,
                msg.sender,
                duration
            );
            gameAddress = address(game);
            _games[realGameId] = gameAddress;
        }
        _lastGameId++;

        // Ask for seed
        emit GameCreated(gameId, gameAddress);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawGameCut(uint256 gameId) external onlyOwner {
        uint8 realGameId = getRealGameId(gameId);
        RestrictedRPSGame game = RestrictedRPSGame(_games[realGameId]);
        game.withdraw();
    }

    ////////////////
    // Public
    ////////////////
    function getRealGameId(uint256 gameId) public pure returns (uint8 realGameId) {
        realGameId = uint8(gameId % _NBR_GAMES);
    }

    ////////////////
    // Internal
    ////////////////

    ////////////////
    // Private
    ////////////////
}
