pragma solidity ^0.5.0;

contract Structs {    
    
    struct Phase {
        uint256 start;
        uint256 end;
        uint256 price;
        uint256 saleSupply;
        uint256 amountSold;
    }

    struct Bonus {
        uint256 start;
        uint256 end;
        uint256 percent;
    }
}