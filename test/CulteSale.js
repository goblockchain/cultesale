const CulteSale = artifacts.require("CulteSale");
const CulteToken = artifacts.require("CulteToken");
const BinanceCotationOracle = artifacts.require("BinanceCotationOracle");


contract("CulteSale", async accounts => {

    let wallet;
    let clt;
    let sale;
    let binanceOracle;

    beforeEach('Setup contract for each test', async () => {
        // setting up contracts
        wallet = accounts[9];

        clt = await CulteToken.new();
        binanceOracle = await BinanceCotationOracle.new();
        sale = await CulteSale.new(
            clt.address,
            wallet,
            Math.floor(Date.now() / 1000),
            binanceOracle.address
        );

        // sending all tokens to sales contract
        await clt.transfer(sale.address, "210000000000000000000000000");
    });


    it("Should give 2% bonus token in the sale", async () => {

        let saleBalanceBefore = await clt.balanceOf(sale.address);
        let walletBalanceBefore = await web3.eth.getBalance(wallet);
        let result = await sale.buyCulteWithBnb(accounts[0], {
            from: accounts[0],
            value: web3.utils.toWei("4.50", "ether")
        });
 
        let saleBalanceAfter = await clt.balanceOf(sale.address);
        let walletBalanceAfter = await web3.eth.getBalance(wallet);

        assert.isTrue(saleBalanceBefore > saleBalanceAfter, "Sale balance not decreased");
        assert.isTrue(walletBalanceAfter > walletBalanceBefore, "Wallet balance not increased");

        let originalAmount = result.logs[0].args._originalAmount.toNumber();
        let bonusAmount = result.logs[0].args._bonusAmount.toNumber();
        let assertion = Math.trunc(originalAmount * 2 / 100);

        assert.equal(result.logs[0].args._receiver, accounts[0]);
        assert.equal(bonusAmount, Math.trunc(assertion), "assertion("+assertion+") != bonusAmount("+bonusAmount+")");
    });

    it("Should give 4% bonus token in the sale", async () => {

        let saleBalanceBefore = await clt.balanceOf(sale.address);
        let walletBalanceBefore = await web3.eth.getBalance(wallet);
        let result = await sale.buyCulteWithBnb(accounts[0], {
            from: accounts[0],
            value: web3.utils.toWei("7.50", "ether")
        });
 
        let saleBalanceAfter = await clt.balanceOf(sale.address);
        let walletBalanceAfter = await web3.eth.getBalance(wallet);

        assert.isTrue(saleBalanceBefore > saleBalanceAfter, "Sale balance not decreased");
        assert.isTrue(walletBalanceAfter > walletBalanceBefore, "Wallet balance not increased");

        let originalAmount = result.logs[0].args._originalAmount.toNumber();
        let bonusAmount = result.logs[0].args._bonusAmount.toNumber();
        let assertion = Math.trunc(originalAmount * 4 / 100);

        assert.equal(result.logs[0].args._receiver, accounts[0]);
        assert.equal(bonusAmount, Math.trunc(assertion), "assertion("+assertion+") != bonusAmount("+bonusAmount+")");
    });

    it("Should give 10% bonus token in the sale", async () => {

        let saleBalanceBefore = await clt.balanceOf(sale.address);
        let walletBalanceBefore = await web3.eth.getBalance(wallet);
        let result = await sale.buyCulteWithBnb(accounts[0], {
            from: accounts[0],
            value: web3.utils.toWei("16", "ether")
        });
 
        let saleBalanceAfter = await clt.balanceOf(sale.address);
        let walletBalanceAfter = await web3.eth.getBalance(wallet);

        assert.isTrue(saleBalanceBefore > saleBalanceAfter, "Sale balance not decreased");
        assert.isTrue(walletBalanceAfter > walletBalanceBefore, "Wallet balance not increased");

        let originalAmount = result.logs[0].args._originalAmount.toNumber();
        let bonusAmount = result.logs[0].args._bonusAmount.toNumber();
        let assertion = Math.trunc(originalAmount * 10 / 100);

        assert.equal(result.logs[0].args._receiver, accounts[0]);
        assert.equal(bonusAmount, Math.trunc(assertion), "assertion("+assertion+") != bonusAmount("+bonusAmount+")");
    });

    it("Should apply for offer 1", async () => {

        let result = await sale.buyCulteWithBnb(accounts[0], {
            from: accounts[0],
            value: web3.utils.toWei("1", "ether")
        });
 
        let cultPrice = result.logs[0].args._currentPrice.toNumber();

        let binancePrice = (await binanceOracle.getCurrentCentAsBnb()).toNumber();
        assert.equal(cultPrice, binancePrice * 5);
    });

    it("Should apply for offer 2", async () => {

        let myDate = new Date("June 21, 2021 00:01:00");
        let myEpoch = myDate.getTime() / 1000.0;

        // Init mock sales to offer 2 ***********************************************
        let newClt = await CulteToken.new();
        let newBinanceOracle = await BinanceCotationOracle.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            Math.floor(myEpoch),
            newBinanceOracle.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, "210000000000000000000000000");
        // ***************************************************************************

        let result = await newSale.buyCulteWithBnb(accounts[0], {
            from: accounts[0],
            value: web3.utils.toWei("1", "ether")
        });
 
        let cultPrice = result.logs[0].args._currentPrice.toNumber();

        let binancePrice = (await binanceOracle.getCurrentCentAsBnb()).toNumber();
        assert.equal(cultPrice, binancePrice * 7);
    });

    it("Should apply for offer 3", async () => {

        let myDate = new Date("May 7, 2021 00:01:00");
        let myEpoch = myDate.getTime() / 1000.0;

        // Init mock sales to offer 3 ***********************************************
        let newClt = await CulteToken.new();
        let newBinanceOracle = await BinanceCotationOracle.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            Math.floor(myEpoch),
            newBinanceOracle.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, "210000000000000000000000000");
        // ***************************************************************************

        let result = await newSale.buyCulteWithBnb(accounts[0], {
            from: accounts[0],
            value: web3.utils.toWei("1", "ether")
        });
 
        let cultPrice = result.logs[0].args._currentPrice.toNumber();
        let binancePrice = (await binanceOracle.getCurrentCentAsBnb()).toNumber();
        assert.equal(cultPrice, binancePrice * 10);
    });

});

