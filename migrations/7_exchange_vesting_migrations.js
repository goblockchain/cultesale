const CulteToken = artifacts.require("CulteToken");
const ExchangeVesting = artifacts.require("ExchangeVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = accounts[5];
  const beneficiary = accounts[5];//'0x5d529F1cB746a7f2bc24459385394Fb8F52DE55A'//accounts[5];
  
  await deployer.deploy(
    ExchangeVesting, 
    CulteToken.address, 
    beneficiary, 
    { from: owner }
  );

  await token.transfer(ExchangeVesting.address, 21000000, { from: owner });
};

