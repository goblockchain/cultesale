const CulteToken = artifacts.require("CulteToken");
const TeamVesting = artifacts.require("TeamVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = accounts[5];
  const beneficiary = accounts[5];//'0x5d529F1cB746a7f2bc24459385394Fb8F52DE55A'//accounts[5];
  
  await deployer.deploy(
    TeamVesting, 
    token.address, 
    beneficiary, 
    Math.floor(Date.now() / 1000), 
    { from: owner }
  );

  await token.transfer(TeamVesting.address, 21000000, { from: owner });
};

