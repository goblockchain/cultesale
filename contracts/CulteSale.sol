pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/BadERC20.sol";
import "./interfaces/Medianizer.sol";
import "./CulteVesting.sol";

/**
 * @title CLT tokens sale contract
 * @notice This contract is used to sell CLT tokens (accepts BNB and DAI) at a fixed USD price
 */
contract CulteSale is Ownable, CulteVesting {

    Medianizer public medianizer;
    ERC20 public CLT;

    address payable public wallet;
    uint public startDate;
    uint public endDate;
    bool public postponed = false;

    //uint[4] private prices = [5*10**16, 7*10**16, 10*10**16];
    uint[4] private minimumPerPurchase = [25000, 10000, 1000];
    //uint[4] private saleSupply = [21*10**6, 21*10**6, 42*10**6];
    //uint[4] private amountSold = [0,0,0,0];

    struct Phase {
        uint256 start;
        uint256 end;
        uint256 price;
        uint256 saleSupply;
        uint256 amountSold;
    }

    Phase[] phases;
   
    /**
     * @notice Initializes the contract
     * @param _medianizerContractAddress The address of the Medianizer contract
     * @param _culteTokenContractAddress The address of the CLT token contract
     * @param _initialWallet the address of the wallet that will receive the funds
     * @param _startDate the sale start date
     */
    constructor(
        address _medianizerContractAddress,
        address _culteTokenContractAddress,
        address payable _initialWallet,
        uint _startDate
    )
    public
    CulteVesting(
        IERC20(_culteTokenContractAddress), // (_token) Address of the token to be vested
        _initialWallet,                     // (_beneficiary) Address of the beneficiary to whom vested tokens are transferred
        now,                                // (_start) The time (as Unix time) at which point vesting starts
        139 days,                           // (_cliffDuration) Duration in seconds of the cliff in which tokens will begin to vest
        30 * 100 days                       // (_duration) Duration in seconds of the period in which the tokens will vest
    )
    {
        require(_initialWallet != address(0), "need a wallet to receive funds");
        medianizer = Medianizer(_medianizerContractAddress);
        CLT = ERC20(_culteTokenContractAddress);
        wallet = _initialWallet;
        startDate = _startDate;
        endDate = _startDate + 139 days;

        uint256 start0 = startDate;             // 08/15 to 09/30 U$ 0,05 => 46 days
        uint256 start1 = startDate + 47 days;   // 10/01 to 11/15 U$ 0,07 => 45 days
        uint256 start2 = startDate + 92 days;   // 11/16 to 12/31 U$ 0,10 => 45 days
        uint256 salesEnd = startDate + 136 days;// 01/01/2022 => sales ending

        phases[0] = Phase(start0, start1, 5*10**16, 21*10**6, 0);
        phases[1] = Phase(start1, start2, 7*10**16, 21*10**6, 0);
        phases[2] = Phase(start2, salesEnd, 10*10**16, 42*10**6, 0);
    }

    /**
     * @notice Modifier checks if sale is currently active
     */
    modifier onlyWhileOpen() {
        require(now >= startDate && now <= endDate);
        _;
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
        uint256 culteAmount = getCulteAmountWithBnb(msg.value);

        require(
            CLT.transfer(_to, culteAmount),
            "CLT Transfer failed"
        );

        address(wallet).transfer(msg.value);
    }

    /**
     * @notice Fallback - Buys CLT with msg.value
     */
    function() external payable {
        buyCulteWithBnb(msg.sender);
    }

    /**
     * @notice Returns the amount of CLT that can be bought using a specific amount of BNB
     * @param _bnbAmount An amount of BNB
     * @return The amount of CLT
     */
    function getCulteAmountWithBnb(uint256 _bnbAmount) public returns (uint256) {
        uint256 bnbUsdPair = getBnbUsdPair(); // Default to 331 for test

        uint256 usdAmount = SafeMath.div(SafeMath.mul(_bnbAmount, bnbUsdPair),10**18);
        uint256 culteAmount = getCulteAmountWithUSD(usdAmount);

        return culteAmount;
    }

    /**
    * @notice Returns the sales phase based on the current date
    * @return The sales phase
    */
    function getSalesPhase() internal view returns (Phase storage) {
        for(uint256 i = 0; i < phases.length; i++) {
            if(now >= phases[i].start && now <= phases[i].end) {
                return phases[i];
            }
        }
        return phases[0];
    }

    /**
     * @notice Returns the amount of CLT that can be bought using a specific amount of DAI
     * @param _usdAmount An amount of DAI
     * @return The amount of CLT
     */
    function getCulteAmountWithUSD(uint256 _usdAmount) public returns (uint256) {

        uint256 residualAmount = _usdAmount;
        Phase storage salesPhase = getSalesPhase();
        uint256 tokenPrice = salesPhase.price;
        uint256 quantity = SafeMath.div(residualAmount, tokenPrice);
        uint256 culteAmount;

        /*
        for (uint i = 0; i < 3; i++) {
            if (i == 2)
                require(
                    SafeMath.add(amountSold[0], amountSold[1]) > 10000000,
                    "Phase 2 not yet started."
                );
            quantity = SafeMath.div(residualAmount, prices[i]);
            if (quantity > minimumPerPurchase[i] || residualAmount < usdAmount)
                if (quantity <= SafeMath.sub(saleSupply[i], amountSold[i])) {
                    amountSold[i] = SafeMath.add(amountSold[i], quantity);
                    culteAmount = SafeMath.add(culteAmount, quantity);
                    return SafeMath.mul(culteAmount,10*10**17);
                } else { // reached the end of the price cap, sell all in the cap by the discounted rate and the remainder in the next price.
                    uint amountToSell = SafeMath.sub(saleSupply[i], amountSold[i]);
                    amountSold[i] = SafeMath.add(amountSold[i], amountToSell);
                    culteAmount = SafeMath.add(culteAmount, amountToSell);
                    residualAmount = SafeMath.sub(residualAmount, amountToSell);
                }
        */

        if (quantity <= SafeMath.sub(salesPhase.saleSupply, salesPhase.amountSold)) {
            salesPhase.amountSold = SafeMath.add(salesPhase.amountSold, quantity);
            culteAmount = SafeMath.add(culteAmount, quantity);
            return SafeMath.mul(culteAmount,10*10**17);
        } else { // reached the end of the price cap, sell all in the cap by the discounted rate and the remainder in the next price.
            uint amountToSell = SafeMath.sub(salesPhase.saleSupply, salesPhase.amountSold);
            salesPhase.amountSold = SafeMath.add(salesPhase.amountSold, amountToSell);
            culteAmount = SafeMath.add(culteAmount, amountToSell);
            residualAmount = SafeMath.sub(residualAmount, amountToSell);
        }
        
        require(culteAmount > 0, "Invalid purchase, check minimum values.");
        return SafeMath.mul(culteAmount,10*10**17);
    }

    /**
     * @notice Gets the BNBUSD pair from the Medianizer contract
     * @return The pair as an uint256
     */
    function getBnbUsdPair() public pure returns (uint256) {
        //bytes32 pair = medianizer.read();
        //return uint256(pair);
        return 331;
    }

        /**
     * @notice Gets the Total tokens sold
     * @return The total as an uint256
     */
    function getTotalTokensSold() public view returns (uint256 total) {
        for (uint i = 0; i < phases.length; i++)
            total += total.add(phases[i].amountSold);
    }
}