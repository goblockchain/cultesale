const CulteToken = artifacts.require("CulteToken");
const CulteVesting = artifacts.require("CulteVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = '0xEe7512B762682d5F4252eB20e46A3CcEE3a74298';//accounts[5];
  const beneficiary = '0xA8A37557ccf13411ecDACB01Cd550ce070e2290D';//accounts[5];
  
  await deployer.deploy(
    CulteVesting, 
    token.address, 
    beneficiary,
    //13/03/2022 00:00:01
    1647129601
  );

  let vesting = await CulteVesting.deployed();
  // await token.transfer(CulteVesting.address, web3.utils.toWei("21000000", "ether"));
  await vesting.transferOwnership(owner);
};

