const BinanceCotationOracle = artifacts.require("BinanceCotationOracle");

module.exports = async (deployer, network, accounts) => {
  const owner = accounts[5];//'0x5d529F1cB746a7f2bc24459385394Fb8F52DE55A'  
  deployer.deploy(BinanceCotationOracle, { from: owner });
};