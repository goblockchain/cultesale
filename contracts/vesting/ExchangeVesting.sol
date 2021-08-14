pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "../sales/CulteSale.sol";

/**
 * @title ExchangeVesting
 * @dev A token holder contract that can release its token balance gradually
 * based on the sale of tokens by another contract.
 */
contract ExchangeVesting is Ownable {
    // The vesting schedule is based on the amount of sales from the sales contract
    // solhint-disable not-rely-on-time

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event TokensReleased(uint256 amount);
    event VestingRevoked();

    // beneficiary of tokens after they are released
    address public beneficiary;

    // token contract
    IERC20 public token;

    // Durations and timestamps are expressed in UNIX time, the same units as now.
    uint256 public released;

    /**
     * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
     * beneficiary, gradually as tokens are sold.
     * @param _token address of the token to be vested
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     */
    constructor (IERC20 _token, address _beneficiary) public {
        // solhint-disable-next-line max-line-length
        require(_beneficiary != address(0), "ExchangeVesting: beneficiary is the zero address");

        beneficiary = _beneficiary;
        token = _token;
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     */
    function release(uint256 _amount) public onlyOwner {
        require(token.balanceOf(address(this)) > _amount, "ExchangeVesting: amount overflows the balance");
        uint256 tokensToTransfer = _amount;
        token.safeTransfer(beneficiary, tokensToTransfer);
        released = released.add(_amount);
        emit TokensReleased(_amount);
    }

}