const CulteToken = artifacts.require("CulteToken");
const ExchangeVesting = artifacts.require("ExchangeVesting");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  const owner = '0xEe7512B762682d5F4252eB20e46A3CcEE3a74298';//accounts[5];
  const beneficiary = '0x5911D9452d559CBb9C7b6846F095f20B57EAD56B';//accounts[5];//'0x5d529F1cB746a7f2bc24459385394Fb8F52DE55A'//accounts[5];
  
  await deployer.deploy(
    ExchangeVesting, 
    token.address, 
    beneficiary
  );

  let vesting = await ExchangeVesting.deployed();
  // await token.transfer(ExchangeVesting.address, web3.utils.toWei("21000000", "ether"));
  await vesting.transferOwnership(owner);
};

