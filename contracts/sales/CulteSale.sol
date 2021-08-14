pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "../interfaces/BadERC20.sol";
import "../interfaces/Medianizer.sol";
import "../CulteToken.sol";
import "../vesting/CulteVesting.sol";
import "./Structs.sol";
import "./BinanceCotationOracle.sol";

/**
 * @title CLT tokens sale contract
 * @notice This contract is used to sell CLT tokens (accepts BNB and DAI) at a fixed USD price
 */
contract CulteSale is Ownable {

    using SafeMath for uint256;

    IERC20 public CLT;
    BinanceCotationOracle private binanceOracle;
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
     * @param _binanceOracle the cotation oracle
     */
    constructor(
        address _culteTokenAddress, 
        address payable _initialWallet,
        uint _startDate, 
        address _binanceOracle
    ) public {
        require(_initialWallet != address(0), "need a wallet to receive funds");

        CLT = ERC20(_culteTokenAddress);
        wallet = _initialWallet;
        startDate = _startDate;
        endDate = _startDate + 139 days;

        binanceOracle = BinanceCotationOracle(_binanceOracle);

        setSalePhases();
        setBonus();
    }

    /**
     * @notice Modifier checks if sale is currently active
     */
    modifier onlyWhileOpen() {
        uint256 _start = startDate;
        uint256 _end = endDate;
        require(now >= _start && now <= _end, "Sale has not started yet");
        _;
    }

    event CLTBought(address _receiver, uint256 _originalAmount, uint256 _bonusAmount, uint256 _currentPrice);

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
     * @notice Postpones the sale for 30 additional days
     */
    function postponeSale() public onlyOwner {
        endDate = endDate + 30 days;
    }

    /**
     * @notice Buys CLT tokens with BNB
     * @param _to The address that will receive the CLT
     */
    function buyCulteWithBnb(address _to) public payable onlyWhileOpen {
        Structs.Phase memory _salePhase = getCurrentPhase();
        uint256 culteAmount = getCulteAmount(msg.value, _salePhase);
        uint256 bonusAmount = applyBonus(culteAmount);
        uint256 totalCulte = culteAmount;
        totalCulte = totalCulte.add(bonusAmount);

        require(
            CLT.transfer(_to, totalCulte),
            "CLT Transfer failed"
        );

        address(wallet).transfer(msg.value);

        emit CLTBought(
            _to, 
            culteAmount, 
            bonusAmount,
            binanceOracle.getCurrentCentAsBnb().mul(_salePhase.timesPrice)
        );
    }

    /**
     * @notice Returns the amount of CLT that can be bought using a specific amount of $USD
     * @param _bnbAmount An amount of BNB to calculate
     * @return The amount of CLT
     */
    function getCulteAmount(uint256 _bnbAmount, Structs.Phase memory _salesPhase) public returns (uint256) {

        uint256 tokenPrice = binanceOracle.getCurrentCentAsBnb().mul(_salesPhase.timesPrice);
        uint256 quantity = SafeMath.div(_bnbAmount, tokenPrice);

        // check for tokens in saleSupply existance
        require(quantity > 0, "Quantity of calculated tokens should be greater than zero");
        require(quantity <= CLT.balanceOf(address(this)), "No more tokens available to be  bougth");

        // Updates the amount sold
        soldAmount = soldAmount.add(quantity);

        return quantity;
    }

    /**
     * @notice Apply and return the bonus per sale
     * @param _cltAmount The amount of CLT that is being bougth
     * @return The amount with the bonus applied
     */
    function applyBonus(uint256 _cltAmount) public view returns (uint256) {

        uint256 divCheck = _cltAmount.mul(100);
        require(divCheck.div(100) == _cltAmount, "_amount to small for percent calculation");
        uint256 currentBonus = getCurrentBonus(_cltAmount);
        uint256 mult = _cltAmount.mul(currentBonus);

        return mult.div(100);
    }

    /**
    * @notice Returns the sales phase based on the current date
    * @return The sales phase
    */
    function getCurrentPhase() internal view returns (Structs.Phase storage) {

        for(uint256 i = 0; i < phases.length; i++) {

            uint256 _start = phases[i].start;
            uint256 _end = phases[i].end;

            if(now >= _start && now <= _end) {
                return phases[i];
            }
        }
        return phases[0];
    }

    /**
    * @notice Returns the bonus percent value based in the corresponding amount
    * @param _amount The amount to be used
    * @return The amount as percent
    */
    function getCurrentBonus(uint256 _amount) internal view returns (uint256) {
        for(uint256 i = 0; i < bonus.length; i++) {
            if(_amount >= bonus[i].start && _amount <= bonus[i].end) {
                return bonus[i].percent;
            }
        }
        return bonus[0].percent;
    }

    /**
     * @notice Fallback - Buys CLT with msg.value
     */
    function() external payable {
        buyCulteWithBnb(msg.sender);
    }
}