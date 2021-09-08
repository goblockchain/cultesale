const BEP20Token = artifacts.require("BEP20Token");

module.exports = async (deployer, network, accounts) => {
  const owner = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';
  await deployer.deploy(BEP20Token);
  const busd = await BEP20Token.deployed();
  await busd.transfer(owner,  web3.utils.toWei("2000000"));
  await busd.transfer(accounts[0], web3.utils.toWei("2000000"));
  await busd.transfer('0x728A84269139A89F1ee5CCe2fD7aD39973bA611a', web3.utils.toWei("2000000"));
};
