pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract BinanceCotationOracle is Ownable {

    uint256 private dolarToBnb = 25*10**14;
    uint256 private centToBnb = 25*10**12;

    constructor() public {
        dolarToBnb = 25*10**14;
        centToBnb = 25*10**12;
    }

    function updateDolar(uint256 _newValue) public onlyOwner {
        require(_newValue != dolarToBnb, "New value should be different.");
        require(_newValue != 0, "New value should be greater than.");
        dolarToBnb = _newValue;
    }

    function updateCent(uint256 _newValue) public onlyOwner {
        require(_newValue != centToBnb, "New value should be different.");
        require(_newValue != 0, "New value should be greater than.");
        centToBnb = _newValue;
    }

    function getCurrentDolarAsBnb() public view returns (uint256) {
        return dolarToBnb;
    }

    function getCurrentCentAsBnb() public view returns (uint256) {
        return centToBnb;
    }
}