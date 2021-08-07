pragma solidity ^0.5.0;


/**
 * @title CLT tokens sale contract mock, for testing team vesting
 * @notice Total tokens sold are editable and remain in state
 * to enable quick testing of contracts relying on it
 */
contract CulteSaleMock {

    uint public currentTotal;


    function setTotal(uint256 _newTotal) public {
        currentTotal = _newTotal;
    }


    /**
     * @notice Gets the Total tokens sold
     * @return The total as an uint256
     */
    function getTotalTokensSold() public view returns (uint256 total) {
        total = currentTotal;
    }
}