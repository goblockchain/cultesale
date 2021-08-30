pragma solidity >=0.5.0 <=0.5.9;

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