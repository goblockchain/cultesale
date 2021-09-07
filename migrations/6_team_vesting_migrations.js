const CulteToken = artifacts.require("CulteToken");
const TeamVesting = artifacts.require("TeamVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';//accounts[5];
  const beneficiary = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';//accounts[5];
  
  await deployer.deploy(
    TeamVesting, 
    token.address, 
    beneficiary, 
    Math.floor(Date.now() / 1000)
  );

  let vesting = await TeamVesting.deployed();
  // await token.transfer(TeamVesting.address, web3.utils.toWei("21000000", "ether"));
  await vesting.transferOwnership(owner);
};

