pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "../sales/CulteSale.sol";

/**
 * @title TeamVesting
 * @dev A token holder contract that can release its token balance gradually
 * based on the sale of tokens by another contract.
 */
contract TeamVesting is Ownable {
    // The vesting schedule is based on the amount of sales from the sales contract
    // solhint-disable not-rely-on-time

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event TokensReleased(uint256 amount);
    event VestingRevoked();

    // beneficiary of tokens after they are released
    address public beneficiary;

    // token and sale contracts
    IERC20 public token;

    // Durations and timestamps are expressed in UNIX time, the same units as now.
    uint256 public released;
    bool private firstRelease;
    uint256 public nextRelease;

    /**
     * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
     * beneficiary, gradually as tokens are sold.
     * @param _token address of the token to be vested
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     */
    constructor (IERC20 _token, address _beneficiary, uint256 _start) public {
        require(_beneficiary != address(0), "TeamVesting: beneficiary is the zero address");
        require(_start > 0, "TeamVesting: start date is zero");
        
        beneficiary = _beneficiary;
        nextRelease = _start;
        token = _token;
        firstRelease = true;
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     */
    function release() public {
        require(firstRelease || now >= nextRelease, "TeamVesting: no tokens available yet");
        uint256 unreleased = releasableAmount();
        require(unreleased > 0, "TeamVesting: no tokens are due");
        unreleased = unreleased*10**18;
        released = released.add(unreleased);
        token.safeTransfer(beneficiary, unreleased);

        _updateNextRelease();

        emit TokensReleased(unreleased);
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     */
    function releasableAmount() public returns (uint256) {
        //return vestedAmount().sub(released);
        return vestedAmount();
    }

    /**
     * @dev Calculates the amount that has already vested.
     */
    function vestedAmount() public returns (uint256) {
        uint256 currentBalance = token.balanceOf(address(this));
        currentBalance = SafeMath.div(currentBalance, 10**18);

        if(firstRelease) {
            firstRelease = false;
            return 4200000;
        } else if(now >= nextRelease) { // now >= 01/04/22
            if(currentBalance.mul(10000).div(10000) == currentBalance) {
                uint256 percentage = currentBalance.mul(2).div(10000);
                if(percentage > 0) {
                    return percentage;
                }
            }
            return currentBalance;
        }
    }

    /**
     * @notice Allows the owner to revoke the vesting. Tokens already vested
     * remain in the contract, the rest are returned to the owner.
     */
    /*
    function revoke() public onlyOwner {

        uint256 balance = token.balanceOf(address(this));

        uint256 unreleased = releasableAmount();
        uint256 refund = balance.sub(unreleased);

        token.transfer(owner(), refund);

        emit VestingRevoked();
    }
    */

    /**
    * @dev Updates the next release date to be after 31 days past
    */
    function _updateNextRelease() private {
        nextRelease = nextRelease + 31 days;
    }
}