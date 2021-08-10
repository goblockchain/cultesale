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
    CulteSale public saleContract;

    // Durations and timestamps are expressed in UNIX time, the same units as now.
    uint256 public released;
    uint256 public duration; // max duration, tokens returned to creator after lapsed, use timing of the sale.

    /**
     * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
     * beneficiary, gradually as tokens are sold.
     * @param _token address of the token to be vested
     * @param _saleContract Smart contract of the sale to be used as parameter
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     * @param _duration duration in seconds of the period in which the tokens will vest
     */
    constructor (IERC20 _token, CulteSale _saleContract, address _beneficiary, uint256 _duration) public {
        require(_beneficiary != address(0), "TeamVesting: beneficiary is the zero address");
        // solhint-disable-next-line max-line-length
        require(_duration > 0, "TeamVesting: duration is 0");
        // solhint-disable-next-line max-line-length
        require(now.add(_duration) > now, "TeamVesting: final time is before current time");

        beneficiary = _beneficiary;
        duration = _duration;
        token = _token;
        saleContract = _saleContract;
    }

    /**
     * @notice Transfers vested tokens to beneficiary.
     */
    function release() public {
        uint256 unreleased = releasableAmount();

        require(unreleased > 0, "TeamVesting: no tokens are due");

        released = released.add(unreleased);

        token.safeTransfer(beneficiary, unreleased);

        emit TokensReleased(unreleased);
    }

    /**
     * @dev Calculates the amount that has already vested but hasn't been released yet.
     */
    function releasableAmount() public view returns (uint256) {
        return vestedAmount().sub(released);
    }

    /**
     * @dev Calculates the amount that has already vested.
     */
    function vestedAmount() public view returns (uint256) {
        uint256 currentBalance = token.balanceOf(address(this));
        uint256 totalBalance = currentBalance.add(released);
        uint256 tokensSold = saleContract.getTotalTokensSold();
        uint256 ratio = tokensSold.mul(10000).div(42000000 ether);
        return totalBalance.mul(ratio).div(10000);
    }

    /**
     * @notice Allows the owner to revoke the vesting. Tokens already vested
     * remain in the contract, the rest are returned to the owner.
     */
    function revoke() public onlyOwner {

        uint256 balance = token.balanceOf(address(this));

        uint256 unreleased = releasableAmount();
        uint256 refund = balance.sub(unreleased);

        token.transfer(owner(), refund);

        emit VestingRevoked();
    }
}