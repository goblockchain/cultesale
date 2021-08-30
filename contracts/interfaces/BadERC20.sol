pragma solidity >=0.5.0 <=0.5.9;

/**
 * @title Bad ERC20 Interface
 * @dev Necessary because the Tether (USDT) contract is not
 * compliant with the ERC20 standard, and does not return true
 * for successful operations
 */

interface BadERC20 {
   function transfer(address to, uint256 value) external;
   function transferFrom(address from, address to, uint256 value) external;
   function balanceOf(address who) external view returns (uint);
   function decimals() external view returns (uint);
}