const CulteToken = artifacts.require("CulteToken");
const CulteVesting = artifacts.require("CulteVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';//accounts[5];
  const beneficiary = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';//accounts[5];
  
  await deployer.deploy(
    CulteVesting, 
    token.address, 
    beneficiary, 
    Math.floor(Date.now() / 1000)
  );

  let vesting = await CulteVesting.deployed();
  // await token.transfer(CulteVesting.address, web3.utils.toWei("21000000", "ether"));
  await vesting.transferOwnership(owner);
};

