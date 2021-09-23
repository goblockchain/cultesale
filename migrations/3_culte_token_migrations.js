const CulteToken = artifacts.require("CulteToken");

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(CulteToken);
};
