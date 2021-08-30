const CulteSale = artifacts.require("CulteSale");
const CulteToken = artifacts.require("CulteToken");
const BEP20Token = artifacts.require("BEP20Token");

contract("CulteSale", async accounts => {

    let wallet;
    let clt;
    let sale;
    let busd;

    beforeEach('Setup contract for each test', async () => {
        // setting up contracts
        wallet = accounts[9];

        clt = await CulteToken.new();
        busd = await BEP20Token.new();
        sale = await CulteSale.new(
            clt.address,
            wallet,
            Math.floor(Date.now() / 1000),
            busd.address
        );

        // sending all tokens to sales contract
        await clt.transfer(sale.address, 210000000);
    });


    it("Should give 2% bonus token in the sale", async () => {

        let saleBalanceBefore = await clt.balanceOf(sale.address);
        let walletBalanceBefore = await busd.balanceOf(wallet);
        
        let buyer = accounts[0];
        await busd.transfer(buyer, 1500);
        await busd.approve(sale.address, 1500, {from: buyer});

        let result = await sale.buyCulteWithBusd(1500, {
            from: buyer
        });
 
        let saleBalanceAfter = await clt.balanceOf(sale.address);
        let walletBalanceAfter = await busd.balanceOf(wallet);

        assert.isTrue(saleBalanceBefore > saleBalanceAfter, "Sale balance not decreased");
        assert.isTrue(walletBalanceAfter > walletBalanceBefore, "Wallet balance not increased");

        let originalAmount = result.logs[0].args._originalAmount.toString();
        let bonusAmount = result.logs[0].args._bonusAmount.toString();
        let tokenPrice = result.logs[0].args._currentPrice.toString();

        assert.equal("30000", originalAmount);
        assert.equal("600", bonusAmount);
        assert.equal("50000000000000000", tokenPrice);
    });

    it("Should give 4% bonus token in the sale", async () => {

        let saleBalanceBefore = await clt.balanceOf(sale.address);
        let walletBalanceBefore = await busd.balanceOf(wallet);
        
        let buyer = accounts[0];
        await busd.transfer(buyer, 3000);
        await busd.approve(sale.address, 3000, {from: buyer});

        let result = await sale.buyCulteWithBusd(3000, {
            from: buyer
        });
 
        let saleBalanceAfter = await clt.balanceOf(sale.address);
        let walletBalanceAfter = await busd.balanceOf(wallet);

        assert.isTrue(saleBalanceBefore > saleBalanceAfter, "Sale balance not decreased");
        assert.isTrue(walletBalanceAfter > walletBalanceBefore, "Wallet balance not increased");

        let originalAmount = result.logs[0].args._originalAmount.toString();
        let bonusAmount = result.logs[0].args._bonusAmount.toString();
        let tokenPrice = result.logs[0].args._currentPrice.toString();

        assert.equal("60000", originalAmount);
        assert.equal("2400", bonusAmount);
        assert.equal("50000000000000000", tokenPrice);
    });

    it("Should give 10% bonus token in the sale", async () => {

        let saleBalanceBefore = await clt.balanceOf(sale.address);
        let walletBalanceBefore = await busd.balanceOf(wallet);
        
        let buyer = accounts[0];
        await busd.transfer(buyer, 15000);
        await busd.approve(sale.address, 15000, {from: buyer});

        let result = await sale.buyCulteWithBusd(15000, {
            from: buyer
        });
 
        let saleBalanceAfter = await clt.balanceOf(sale.address);
        let walletBalanceAfter = await busd.balanceOf(wallet);

        assert.isTrue(saleBalanceBefore > saleBalanceAfter, "Sale balance not decreased");
        assert.isTrue(walletBalanceAfter > walletBalanceBefore, "Wallet balance not increased");

        let originalAmount = result.logs[0].args._originalAmount.toString();
        let bonusAmount = result.logs[0].args._bonusAmount.toString();
        let tokenPrice = result.logs[0].args._currentPrice.toString();

        assert.equal("300000", originalAmount);
        assert.equal("30000", bonusAmount);
        assert.equal("50000000000000000", tokenPrice);
    });

    it("Should apply for offer 1 (BUSD)", async () => {

        const buyer = accounts[1];

        // Init mock sales to offer 1 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            Math.floor(Date.now() / 1000.0),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, 210000000);
        // ***************************************************************************
        await newBusd.transfer(buyer, 100);
        let busdBalance = await newBusd.balanceOf(buyer);
        assert.equal(busdBalance.toString(), "100", "BUSD balance is not correct");

        await newBusd.approve(newSale.address, 1, {from: buyer});
        let result = await newSale.buyCulteWithBusd(1, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        assert.equal("50000000000000000", cultPrice, "Offer price is not correct");
    });

    it("Should apply for offer 2 (BUSD)", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 50);
        let myEpoch = myDate / 1000;

        const buyer = accounts[1];

        // Init mock sales to offer 2 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            Math.floor(myEpoch),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, 210000000);
        // ***************************************************************************
        await newBusd.transfer(buyer, 100);
        let busdBalance = await newBusd.balanceOf(buyer);
        assert.equal(busdBalance.toString(), "100", "BUSD balance is not correct");

        await newBusd.approve(newSale.address, 1, {from: buyer});
        let result = await newSale.buyCulteWithBusd(1, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        assert.equal("70000000000000000", cultPrice, "Offer price is not correct");
    });

    it("Should apply for offer 3 (BUSD)", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 100);
        let myEpoch = myDate / 1000;
        const buyer = accounts[1];

        // Init mock sales to offer 2 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            Math.floor(myEpoch),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, 210000000);
        // ***************************************************************************
        await newBusd.transfer(buyer, 100);
        let busdBalance = await newBusd.balanceOf(buyer);
        assert.equal(busdBalance.toString(), "100", "BUSD balance is not correct");

        await newBusd.approve(newSale.address, 1, {from: buyer});
        let result = await newSale.buyCulteWithBusd(1, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        assert.equal("100000000000000000", cultPrice, "Offer price is not correct");
    });

});

