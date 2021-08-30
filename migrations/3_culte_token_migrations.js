const CulteToken = artifacts.require("CulteToken");

module.exports = async (deployer, network, accounts) => {
  //const owner = '0xe5cB5A6390784FF6c4aE1054b02F8d32D349D27B';
  await deployer.deploy(CulteToken);
};
