pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract BinanceCotationOracle is Ownable {

    uint256 private usdToBnb = 31*10**14;


    function updateUsdAsBnb(uint256 _newValue) public onlyOwner {
        require(_newValue != usdToBnb, "New value should be different.");
        require(_newValue != 0, "New value should be greater than.");
        usdToBnb = _newValue;
    }

    function getCurrentUsdAsBnb() public view returns (uint256) {
        return usdToBnb;
    }
}