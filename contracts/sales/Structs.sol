pragma solidity ^0.5.0;

contract Structs {

    struct Phase {
        uint256 start;
        uint256 end;
        uint256 timesPrice;
    }

    struct Bonus {
        uint256 start;
        uint256 end;
        uint256 percent;
    }
}