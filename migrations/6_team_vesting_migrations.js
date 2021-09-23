const CulteToken = artifacts.require("CulteToken");
const TeamVesting = artifacts.require("TeamVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = '0xEe7512B762682d5F4252eB20e46A3CcEE3a74298';//accounts[5];
  const beneficiary = '0xF4B0c1D56987D7dd8f753387601B652a3dc3Ad39';//accounts[5];
  
  await deployer.deploy(
    TeamVesting, 
    token.address,
    beneficiary,
    //13/03/2022 00:00:00
    1647129601
  );

  let vesting = await TeamVesting.deployed();
  // await token.transfer(TeamVesting.address, web3.utils.toWei("21000000", "ether"));
  await vesting.transferOwnership(owner);
};

