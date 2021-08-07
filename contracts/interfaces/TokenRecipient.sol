pragma solidity ^0.5.0;

contract TokenRecipient {
    function receiveApproval (address _from, uint256 _value, address _token, bytes32 _extraData) public;
}