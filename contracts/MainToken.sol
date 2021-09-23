pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

/**
 * @dev Implementation of the `IERC20` interface, for the CulteToken
 *
 * As vanilla as it gets, mints 210 million tokens to the sales contract
 * There are no ownership, admin or minting functions after the creation
 */
contract MyToken is ERC20, ERC20Detailed {

    /**
     * @dev Constructor, mints all tokens to deployer.
     */
    constructor() ERC20Detailed("MyToken", "MTK", 18) public {
        _mint(msg.sender, 210000000*10**18);
    }
}