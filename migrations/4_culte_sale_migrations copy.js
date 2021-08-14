const CulteToken = artifacts.require("CulteToken");
const CulteSale = artifacts.require("CulteSale");
const BinanceCotationOracle = artifacts.require("BinanceCotationOracle");

module.exports = async (deployer, network, accounts) => {
  const token = await CulteToken.deployed();
  
  const owner = accounts[5];//'0x5d529F1cB746a7f2bc24459385394Fb8F52DE55A'//accounts[5];
  await deployer.deploy(
    CulteSale, 
    token.address, 
    '0xB0f76D6504df12BA336121492Da8A78e2df8936e', 
    Math.floor(Date.now() / 1000), 
    BinanceCotationOracle.address,
    { from: owner }
  );

  const sale = await CulteSale.deployed();
  await token.transfer(sale.address, 21000000, { from: owner });
};
