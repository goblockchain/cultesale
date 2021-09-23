const CulteToken = artifacts.require("CulteToken");
const CulteSale = artifacts.require("CulteSale");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const busd = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  
  const owner = '0xEe7512B762682d5F4252eB20e46A3CcEE3a74298';
  const beneficiary = '0xEe7512B762682d5F4252eB20e46A3CcEE3a74298';
  try {
      await deployer.deploy(
      CulteSale, 
      token.address, 
      beneficiary, 
      1631538000,
      busd
    );
  } catch(err) {
    console.log(err)
  } 
  const sale = await CulteSale.deployed();
  await sale.transferOwnership(owner);
};
