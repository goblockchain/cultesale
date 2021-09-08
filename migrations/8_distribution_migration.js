const CulteToken = artifacts.require("CulteToken");
const CulteSale = artifacts.require("CulteSale");
const CulteVesting = artifacts.require("CulteVesting");
const TeamVesting = artifacts.require("TeamVesting");
const ExchangeVesting = artifacts.require("ExchangeVesting");

module.exports = async (deployer, network, accounts) => {

    const token = await CulteToken.deployed();
    const sale = await CulteSale.deployed();
    const culteVesting = await CulteVesting.deployed();
    const teamVesting = await TeamVesting.deployed();
    const exchangeVesting = await ExchangeVesting.deployed();

    // Transfer sale amount
    await token.transfer(sale.address, web3.utils.toWei("21000000", "ether"));

    // Transfer Culte Vesting amount
    await token.transfer(CulteVesting.address, web3.utils.toWei("147000000", "ether"));

    // Transfer Team Vesting amount
    await token.transfer(TeamVesting.address, web3.utils.toWei("21000000", "ether"));

    // Transfer Exchange Vesting amount
    await token.transfer(ExchangeVesting.address, web3.utils.toWei("21000000", "ether"));

    // 210000000
    // 0x728A84269139A89F1ee5CCe2fD7aD39973bA611a
}