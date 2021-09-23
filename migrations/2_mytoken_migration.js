var MyToken = artifacts.require("MyToken");

module.exports = function(deployer, network, accounts) {
  // Deploy the Migrations contract as our only task
  deployer.deploy(MyToken);
};