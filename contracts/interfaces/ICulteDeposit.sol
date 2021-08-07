pragma solidity ^0.5.0;

interface ICulteDeposit {
    function tentacles(address tentacle) external returns (string memory);
    function receiveTokens(address token, uint value) external;
    function rescueTokens(address token) external returns (bool success);
}