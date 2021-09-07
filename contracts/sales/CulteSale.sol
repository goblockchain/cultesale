pragma solidity >=0.5.0 <=0.5.9;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IBEP20.sol";
import "../CulteToken.sol";
import "../vesting/CulteVesting.sol";
import "./Structs.sol";

/**
 * @title CLT tokens sale contract
 * @notice This contract is used to sell CLT tokens (accepts BNB and DAI) at a fixed USD price
 */
contract CulteSale is Ownable {

    using SafeMath for uint256;

    IERC20 public CLT;
    IBEP20 public BUSD;

    address payable public wallet;
    uint256 public startDate;
    uint256 public endDate;
    bool public postponed = false;
    uint256 public soldAmount;

    Structs.Phase[] private phases;
    Structs.Bonus[] private bonus;

    /**
     * @notice Initializes the contract
     * @param _culteTokenAddress the address of the token
     * @param _initialWallet the address of the wallet that will receive the funds
     * @param _startDate the sale start date
     */
    constructor(
        address _culteTokenAddress, 
        address payable _initialWallet,
        uint _startDate, 
        address _busdTokenAddress
    ) public {
        require(_initialWallet != address(0), "need a wallet to receive funds");

        CLT = ERC20(_culteTokenAddress);
        BUSD = IBEP20(_busdTokenAddress);
        wallet = _initialWallet;
        startDate = _startDate;
        endDate = _startDate + 90 days;

        setSalePhases();
        setBonus();
    }

    /**
     * @notice Modifier checks if sale is currently active
     */
    modifier onlyWhileOpen() {
        require(now >= startDate, "Sale has not started yet");
        _;
    }

    event CLTBought(address _receiver, uint256 _originalAmount, uint256 _currentPrice);
    event SalesClosed(uint256 _closeDate, uint256 _receiver);

    /**
    * @notice Set the sale phases according to the requirements:
    * ....... Pre-launch dates
    * ....... 08/15 to 09/30 U$ 0,05 => 46 days
    * ....... 10/01 to 11/15 U$ 0,07 => 45 days
    * ....... 11/16 to 12/31 U$ 0,10 => 45 days
    * ....... 01/01/2022 => sales ending
    */
    function setSalePhases() private {

        uint256 start0 = startDate;             // 08/15 to 09/30 U$ 0,05 => 46 days
        // uint256 start1 = startDate + 1 days;   // 10/01 to 11/15 U$ 0,07 => 45 days
        // uint256 start2 = startDate + 2 days;   // 11/16 to 12/31 U$ 0,10 => 45 days
        // uint256 salesEnd = startDate + 3 days;// 01/01/2022 => sales ending

        uint256 start1 = startDate + 47 days;   // 10/01 to 11/15 U$ 0,07 => 45 days
        uint256 start2 = startDate + 92 days;   // 11/16 to 12/31 U$ 0,10 => 45 days
        uint256 salesEnd = startDate + 136 days;// 01/01/2022 => sales ending

        phases.push(Structs.Phase(start0, start1, 5));
        phases.push(Structs.Phase(start1, start2, 7));
        phases.push(Structs.Phase(start2, salesEnd, 10));
    }

    /**
    * @notice Set the pre-launch bonus according to the requirements:
    * ....... Bonus per sale configuration (Applied to entire pre-launch period)
    * ....... Para toda pre-venda mesma regra
    * ....... from 30.000 to 49.999 receive 2% bonus tokens
    * ....... from 50.000 to 99.999 receive 4% bonus tokens
    * ....... from 100.000 to infinity receive 10% bonus tokens
    */
    function setBonus() private {
        bonus.push(Structs.Bonus(30000, 49999, 2)); // 2%
        bonus.push(Structs.Bonus(50000, 99999, 4)); // 4%
        bonus.push(Structs.Bonus(100000, 210000000000000000000000000, 10)); // 10%
    }

    /**
     * @notice Buy CLT tokens with BUSD
     * @param _amount The amount of CLT to be bought
     */
    function buyCulteWithBusd(uint256 _amount, uint256 _exp) public onlyWhileOpen {
        uint256 busdTransferAmount = _amount;
        if(_exp > 0) { 
            busdTransferAmount = SafeMath.mul(_amount, 10*10**(SafeMath.sub(17, _exp)));
        }

        require(_amount <= BUSD.balanceOf(msg.sender), "You do not have sufficient ballance to transfer this amount");
        require(
            BUSD.transferFrom(msg.sender, address(this), busdTransferAmount),
            "BUSD Transfer did not succeed, have you approved the transfer in the contract?"
        );
        require(BUSD.transfer(wallet, busdTransferAmount), "BUSD Transfer to wallet failed");

        Structs.Phase memory _salePhase = getCurrentPhase();

        uint256 tokenPrice = _salePhase.timesPrice;//*10**16;
        uint256 culteAmount;

        if(_exp >= 2) {
            _exp = _exp - 2;
            culteAmount = getCulteAmountWithFractionedBusd(_amount, _exp, tokenPrice);
        } else {
            tokenPrice = tokenPrice*10**16;
            culteAmount = getCulteAmountWithBusd(_amount, tokenPrice);
        }
        
        require(CLT.transfer(msg.sender, culteAmount), "CLT Transfer failed");

        emit CLTBought(
            msg.sender,
            culteAmount,
            tokenPrice
        );
    }

    /**
     * @notice Returns the amount of CLT that can be bought using a specific amount of $USD
     * @param _busdAmount An amount of BUSD to calculate
     * @return The amount of CLT
     */
    function getCulteAmountWithBusd(uint256 _busdAmount, uint256 _tokenPrice) public returns (uint256) {

        uint256 culteAmount = SafeMath.div(_busdAmount, _tokenPrice);

        require(culteAmount > 0, "Quantity of calculated tokens should be greater than zero");
        require(culteAmount >= 1000, "Offer starts on 1000 CULTE");
        require(culteAmount <= CLT.balanceOf(address(this)), "No more tokens available to be  bougth");

        // Updates the amount sold
        uint256 bonusAmount = applyBonus(culteAmount);
        culteAmount = SafeMath.add(culteAmount, bonusAmount);
        soldAmount = SafeMath.add(soldAmount, culteAmount);
        return SafeMath.mul(culteAmount, 10*10**17);
    }

        /**
     * @notice Returns the amount of CLT that can be bought using a specific amount of $USD
     * @param _busdAmount An amount of BUSD to calculate
     * @return The amount of CLT
     */
    function getCulteAmountWithFractionedBusd(uint256 _busdAmount, uint256 _exp, uint256 _tokenPrice) public returns (uint256) {

        uint256 culteAmount = SafeMath.div(_busdAmount, _tokenPrice);

        require(culteAmount > 0, "Quantity of calculated tokens should be greater than zero");
        require(culteAmount >= 1000, "Offer starts on 1000 CULTE");
        require(culteAmount <= CLT.balanceOf(address(this)), "No more tokens available to be  bougth");

        // Updates the amount sold
        uint256 bonusAmount = applyBonus(culteAmount);
        culteAmount = SafeMath.add(culteAmount, bonusAmount);
        soldAmount = SafeMath.add(soldAmount, culteAmount);
        return SafeMath.mul(culteAmount, 10*10**(SafeMath.sub(17, _exp)));
    }

    /**
     * @notice Apply and return the bonus per sale
     * @param _cltAmount The amount of CLT that is being bougth
     * @return The amount with the bonus applied
     */
    function applyBonus(uint256 _cltAmount) public view returns (uint256) {

        //uint256 divCheck = _cltAmount.mul(100);
        //require(divCheck.div(100) == _cltAmount, "_amount to small for percent calculation");
        uint256 currentBonus = getCurrentBonus(_cltAmount);

        if(currentBonus > 0) {
            //uint256 mult = ;
            return _cltAmount.mul(currentBonus).div(100);
        } else {
            return 0;
        }
    }

    /**
    * @notice Returns the sales phase based on the current date
    * @return The sales phase
    */
    function getCurrentPhase() internal view returns (Structs.Phase storage) {

        for(uint256 i = 0; i < phases.length; i++) {

            uint256 _start = phases[i].start;
            uint256 _end = phases[i].end;
            uint256 _now = now;

            if(_now >= _start && _now <= _end) {
                return phases[i];
            }
        }
        return phases[2];
    }

    /**
    * @notice Returns the bonus percent value based in the corresponding amount
    * @param _amount The amount to be used
    * @return The amount as percent
    */
    function getCurrentBonus(uint256 _amount) internal view returns (uint256) {
        for(uint256 i = 0; i < bonus.length; i++) {
            uint256 startAmount = bonus[i].start;
            uint256 endAmount = bonus[i].end;
            if(_amount >= startAmount && _amount <= endAmount) {
                return bonus[i].percent;
            }
        }
        return 0;
    }

    /**
    * @notice Closes the sale and transfer the remaning amount to the wallet address
    */
    function closeSales() public onlyOwner {
        require(now >= endDate, "Sale has not finished yet");
        uint256 remaningAmount = CLT.balanceOf(address(this));
        CLT.transfer(wallet, remaningAmount);
    }
}