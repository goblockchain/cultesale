pragma solidity >=0.5.0 <=0.5.9;


/**
 * @title Medianizer mock contract, to be used for testing.
 * @dev From MakerDAO (https://etherscan.io/address/0x729D19f657BD0614b4985Cf1D82531c67569197B#code)
 * this one just returns a fixed amount (edit below when ETH is worth more than 1k USD)
 */
contract MedianizerMock {
    function read() external pure returns (bytes32) {
        return bytes32(uint(180 * 10**18));
    }
}