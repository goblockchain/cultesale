const CulteToken = artifacts.require("CulteToken");
const ExchangeVesting = artifacts.require("ExchangeVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';//accounts[5];
  const beneficiary = '0xBF4Bb9d82D965cbe99c265DBE7c75243882bBEfa';//accounts[5];//'0x5d529F1cB746a7f2bc24459385394Fb8F52DE55A'//accounts[5];
  
  await deployer.deploy(
    ExchangeVesting, 
    token.address, 
    beneficiary
  );

  let vesting = await ExchangeVesting.deployed();
  // await token.transfer(ExchangeVesting.address, web3.utils.toWei("21000000", "ether"));
  await vesting.transferOwnership(owner);
};

