pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract CulteVesting is Ownable {
    // The vesting schedule is time-based (i.e. using block timestamps as opposed to e.g. block numbers), and is
    // therefore sensitive to timestamp manipulation (which is something miners can do, to a certain degree). Therefore,
    // it is recommended to avoid using short time durations (less than a minute). Typical vesting schemes, with a
    // cliff period of a year and a duration of four years, are safe to use.
    // solhint-disable not-rely-on-time

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event TokensReleased(uint256 amount);
    event VestingRevoked();

    // beneficiary of tokens after they are released
    address public beneficiary;

    IERC20 public token;

    // Durations and timestamps are expressed in UNIX time, the same units as now.
    uint256 public nextRelease;
    uint256 public duration;
    uint256 public released;

    /**
     * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
     * beneficiary, gradually in a linear fashion until start + duration. By then all
     * of the balance will have vested.
     * @param _token address of the token to be vested
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     * @param _start the time (as Unix time) at which point vesting starts
     */

    // Should transfer 147 milions of tokens right on the instantiation
    constructor (IERC20 _token, address _beneficiary, uint256 _start) public {
        // solhint-disable-next-line max-line-length
        require(_beneficiary != address(0), "TokenVesting: beneficiary is the zero address");
        require(_start > 0, "TokenVesting: start date is zero");
        beneficiary = _beneficiary;
        nextRelease = _start;
        token = _token;
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     */
    function release() public {
        require(now >= nextRelease, "TokenVesting: no tokens available yet");
        uint256 unreleased = _releasableAmount();
        require(unreleased > 0, "TokenVesting: no tokens are due");
        released = released.add(unreleased);
        token.safeTransfer(beneficiary, unreleased);
        _updateNextRelease();

        emit TokensReleased(unreleased);
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     */
    function _releasableAmount() private view returns (uint256) {
        uint256 currentBalance = token.balanceOf(address(this));
        //uint256 totalBalance = currentBalance.add(released);
        uint256 amount = currentBalance.mul(2).div(10000);

        if(amount > 0) {
            return amount;
        }
        return currentBalance;
    }

    /**
    * @dev Updates the next release date to be after 31 days past
    */
    function _updateNextRelease() private {
        nextRelease = nextRelease + 31 days;
    }

}