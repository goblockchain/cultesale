const CulteToken = artifacts.require("CulteToken");
const CulteSale = artifacts.require("CulteSale");
const BEP20Token = artifacts.require("BEP20Token");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const busd = await BEP20Token.deployed();
  
  const owner = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';
  try {
      await deployer.deploy(
      CulteSale, 
      token.address, 
      owner, 
      Math.floor(Date.now() / 1000),
      //'0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee'
      busd.address
    );
  } catch(err) {
    console.log(err)
  } 
  const sale = await CulteSale.deployed();
  await sale.transferOwnership(owner);
  // await token.transfer(sale.address, web3.utils.toWei("21000000", "ether"));
};
