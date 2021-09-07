const { default: Web3 } = require("web3");
const {
    BN,
    constants,
    expectEvent,
    expectRevert,
    time
} = require('@openzeppelin/test-helpers');
const {
ZERO_ADDRESS
} = constants;

const {
expect
} = require('chai');

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

        const buyer = accounts[1];
        const amountOfBusd = await web3.utils.toWei("1500", "ether");

        // Init mock sales to offer 1 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            //Math.floor(myEpoch),
            Math.floor(Date.now() / 1000.0),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        await newSale.buyCulteWithBusd(amountOfBusd, 0, { from: buyer });
        
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("30600000000000000000000"));
    });

    it("Should give 4% bonus token in the sale", async () => {

        const buyer = accounts[1];
        const amountOfBusd = await web3.utils.toWei("3000", "ether");

        // Init mock sales to offer 1 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            //Math.floor(myEpoch),
            Math.floor(Date.now() / 1000.0),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        await newSale.buyCulteWithBusd(amountOfBusd, 0, { from: buyer });
        
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("62400000000000000000000"));
    });

    it("Should give 10% bonus token in the sale", async () => {

        const buyer = accounts[1];
        const amountOfBusd = await web3.utils.toWei("6000", "ether");

        // Init mock sales to offer 1 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            //Math.floor(myEpoch),
            Math.floor(Date.now() / 1000.0),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        await newSale.buyCulteWithBusd(amountOfBusd, 0, { from: buyer });
        
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("132000000000000000000000"));
    });

    it("Should close the sales", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 100);
        let myEpoch = myDate / 1000;

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

        // Closes the sale
        await newSale.closeSales();

        let walletBalance = await newClt.balanceOf(wallet);
        let salesBalance = await newClt.balanceOf(newSale.address);
        assert.equal(210000000, walletBalance, "Wallet balance is not correct after sales close");
        assert.equal(0, salesBalance, "Sale balance is not correct after sales close");
    });

    it.only("Should apply for offer 1 - 50.025 (BUSD) => 1000.5 tokens", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 100);
        let myEpoch = myDate / 1000;

        const buyer = accounts[1];
        const amountOfBusd = 50025;//await web3.utils.toWei("50.025", "ether");
        const amountOfCulte = await web3.utils.toWei("1000", "ether");

        // Init mock sales to offer 1 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            //Math.floor(myEpoch),
            Math.floor(Date.now() / 1000.0),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        let result = await newSale.buyCulteWithBusd(amountOfBusd, 3, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        let buyerBalance = (await newClt.balanceOf(buyer)).toString();
        buyerBalance = await web3.utils.toWei("" + buyerBalance, "ether");
        
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("1000500000000000000000"));
    });

    it("Should apply for offer 1 - 50 (BUSD)  => 1000 tokens", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 100);
        let myEpoch = myDate / 1000;

        const buyer = accounts[1];
        const amountOfBusd = await web3.utils.toWei("50", "ether");

        // Init mock sales to offer 1 ***********************************************
        let newClt = await CulteToken.new();
        let newBusd = await BEP20Token.new();
        let newSale = await CulteSale.new(
            newClt.address,
            wallet,
            //Math.floor(myEpoch),
            Math.floor(Date.now() / 1000.0),
            newBusd.address
        );
        // sending all tokens to sales contract
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        let result = await newSale.buyCulteWithBusd(amountOfBusd, 0, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        let buyerBalance = (await newClt.balanceOf(buyer)).toString();
        buyerBalance = await web3.utils.toWei("" + buyerBalance, "ether");
        
        expect(cultPrice).to.be.bignumber.equal(new BN("50000000000000000"));
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("1000000000000000000000"));
    });

    it("Should apply for offer 2 (BUSD)", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 50);
        let myEpoch = myDate / 1000;

        const buyer = accounts[1];
        const amountOfBusd = await web3.utils.toWei("70", "ether");

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
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        let result = await newSale.buyCulteWithBusd(amountOfBusd, 0, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        let buyerBalance = (await newClt.balanceOf(buyer)).toString();
        buyerBalance = await web3.utils.toWei("" + buyerBalance, "ether");
        
        expect(cultPrice).to.be.bignumber.equal(new BN("70000000000000000"));
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("1000000000000000000000"));
    });

    it("Should apply for offer 3 (BUSD)", async () => {

        let myDate = new Date();
        myDate = myDate.setDate(myDate.getDate() - 100);
        let myEpoch = myDate / 1000;
        const buyer = accounts[1];
        const amountOfBusd = await web3.utils.toWei("100", "ether");

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
        await newClt.transfer(newSale.address, await web3.utils.toWei("210000000", "ether"));
        // ***************************************************************************
        await newBusd.transfer(buyer, amountOfBusd);
        await newBusd.approve(newSale.address, amountOfBusd, {from: buyer});
       
        let result = await newSale.buyCulteWithBusd(amountOfBusd, 0, { from: buyer });
        let cultPrice = result.logs[0].args._currentPrice.toString();
        let buyerBalance = (await newClt.balanceOf(buyer)).toString();
        buyerBalance = await web3.utils.toWei("" + buyerBalance, "ether");
        
        expect(cultPrice).to.be.bignumber.equal(new BN("100000000000000000"));
        expect(await newClt.balanceOf(buyer)).to.be.bignumber.equal(new BN("1000000000000000000000"));
    });

});

