pragma solidity >=0.5.0 <=0.5.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

/**
 * @dev Implementation of the `IERC20` interface, for the CulteToken
 *
 * As vanilla as it gets, mints 210 million tokens to the sales contract
 * There are no ownership, admin or minting functions after the creation
 */
contract CulteToken is ERC20, ERC20Detailed {

    /**
     * @dev Constructor, mints all tokens to deployer.
     */
    constructor() ERC20Detailed("Cultecoin", "CULTE", 18) public {
        _mint(msg.sender, 210000000*10**18); //210 million
    }
}