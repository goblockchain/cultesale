pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/Tentacle.sol";

/**
 * @dev Implementation of the `IERC20` interface, for the CulteToken
 *
 * As vanilla as it gets, mints 210 million tokens to the sales contract
 * There are no ownership, admin or minting functions after the creation
 */
contract CulteToken is ERC20 {
    string public constant name = "CulteToken";
    string public constant symbol = "CLT";
    uint256 public constant decimals = 18;

    /**
     * @dev Constructor, mints all tokens to deployer.
     */
    constructor() public {
        _mint(msg.sender, 21*10**(7 + 18)); //210 million
    }

    /**
     * @dev Function to deposit tokens in Culte with one transaction
     * @notice Will approve and call depositERC20 in the user provided address
     * @param destination address in which to deposit tokens
     * @param quantity quantity to be deposited
     */
    function deposit(address destination, uint256 quantity) public {
        approve(destination, quantity);
        ITentacle(destination).depositERC20(msg.sender, address(this));
    }
}
