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

const truffleAssert = require('truffle-assertions');

const CulteDeposit = artifacts.require('CulteDepositCore');
const Tentacle = artifacts.require('Tentacle');
const CulteToken = artifacts.require("CulteToken");
const DAI = artifacts.require("DSToken");

contract("CulteDeposit", async accounts => {

    beforeEach('setup contract for each test', async function () {
        // actors
        owner = accounts[0];
        depositor = accounts[1];
        receiver = accounts[2];
        nullAddress = "0x0000000000000000000000000000000000000000"

        // contracts
        clt = await CulteToken.new({
            from: depositor
        });
        dai = await DAI.new("0xD41", {
            from: depositor
        });
        deposit = await CulteDeposit.new({
            from: owner
        });

        // deposit address
        let newTentacle = await deposit.newTentacle("depositor UID", {
            from: owner
        })

        tentacleContract = await Tentacle.at(newTentacle.logs[0].args.tentacle)
    })

    // Setup
    it('owner is set correctly', async function () {
        assert.equal(await deposit.owner(), owner);
    });

    // Creating deposit addresses

    it('owner can create deposit address', async function () {
        let result = await deposit.newTentacle("testDepositAddress", {
            from: owner
        })

        await truffleAssert.eventEmitted(result, 'NewTentacle', (ev) => {
            return ev.uid == "testDepositAddress";
        });
    });

    it('owner can create multiple deposit addresses', async function () {
        let result = await deposit.batchNewTentacles(["test1", "test2"], {
            from: owner
        })

        await truffleAssert.eventEmitted(result, 'NewTentacle', (ev) => {
            return ev.uid == "test1" || ev.uid == "test2";
        });
    });

    it('only owner can create deposit address', async function () {
        await truffleAssert.reverts(
            deposit.newTentacle("textDepositAddress", {
                from: depositor
            }),
            "Ownable: caller is not the owner"
        );
    });

    it('only owner can create multiple deposit addresses', async function () {
        await truffleAssert.reverts(
            deposit.batchNewTentacles(["test", "test3"], {
                from: depositor
            }),
            "Ownable: caller is not the owner"
        );
    });

    // Depositing ETH
    it('anyone can deposit ether', async function () {
        // sending ether
        result = await tentacleContract.send(555555);

        // deposit (core) event should be emited
        events = await deposit.getPastEvents('Deposit', {
            fromBlock: 0,
            toBlock: 'latest'
        })

        assert.equal(events[0].returnValues.value, 555555)
        assert.equal(events[0].returnValues.uid, tentacleContract.address)
        assert.equal(events[0].returnValues.tokenAddress, nullAddress)

        // deposit (core) should have the balance
        let coreBalance = await web3.eth.getBalance(deposit.address)
        assert.equal(coreBalance, 555555)
    });

    // Depositing ERC20 (DAI), 2txs: approve and then depositERC20
    it('Depositing regular ERC20', async function () {
        // approving an amount
        await dai.approve(tentacleContract.address, 1000001, {
            from: depositor
        })

        // deposit will cause the whole allowance to be deposited
        result = await tentacleContract.depositERC20(depositor, dai.address, {
            from: depositor
        })

        // deposit (core) event should be emited
        events = await deposit.getPastEvents('Deposit', {
            fromBlock: 0,
            toBlock: 'latest'
        })

        assert.equal(events[0].returnValues.value, 1000001)
        assert.equal(events[0].returnValues.uid, tentacleContract.address)
        assert.equal(events[0].returnValues.tokenAddress, dai.address)

        // deposit (core) should have the balance
        daiBalance = await dai.balanceOf(deposit.address)
        assert.equal(daiBalance.toNumber(), 1000001)
    });

    // Deposit CulteToken in one step
    it('Deposit CulteToken in one transaction', async function () {
        // depositing CLT
        await clt.deposit(tentacleContract.address, 1000005, {
            from: depositor
        })

        // deposit (core) event should be emited
        events = await deposit.getPastEvents('Deposit', {
            fromBlock: 0,
            toBlock: 'latest'
        })

        assert.equal(events[0].returnValues.value, 1000005)
        assert.equal(events[0].returnValues.uid, tentacleContract.address)
        assert.equal(events[0].returnValues.tokenAddress, clt.address)

        // deposit (core) should have the balance
        cltBalance = await clt.balanceOf(deposit.address)
        assert.equal(cltBalance.toNumber(), 1000005)
    });

    // Transfer tokens incorrectly (using transfer), then rescuing tokens
    it('Transfer tokens incorrectly (using transfer), then rescuing tokens', async function () {
        // transfering an amount
        await clt.transfer(tentacleContract.address, 500, {
            from: depositor
        })

        // balance will be stuck in tentacle
        tentacleBalance = await clt.balanceOf(tentacleContract.address)
        assert.equal(tentacleBalance.toNumber(), 500)

        // deposit (core) should have 0 balance
        coreBalance = await clt.balanceOf(deposit.address)
        assert.equal(coreBalance.toNumber(), 0)

        // calling rescueTokens (anyone can do it, funds are transfered to core)
        await deposit.rescueTokens(clt.address, tentacleContract.address, {
            from: accounts[7]
        })

        // // deposit (core) event should be emited
        events = await deposit.getPastEvents('Deposit', {
            fromBlock: 0,
            toBlock: 'latest'
        })

        assert.equal(events[0].returnValues.value, 500)
        assert.equal(events[0].returnValues.uid, tentacleContract.address)
        assert.equal(events[0].returnValues.tokenAddress, clt.address)

        // balance no longer in tentacle
        tentacleBalance = await clt.balanceOf(tentacleContract.address)
        assert.equal(tentacleBalance.toNumber(), 0)

        // deposit (core) should have the balance
        coreBalance = await clt.balanceOf(deposit.address)
        assert.equal(coreBalance.toNumber(), 500)
    });

    // Withdraw ETH
    it('Withdraw ETH', async function () {
        // sending ether
        result = await tentacleContract.send(555555);

        result = await deposit.withdraw("depositor UID", receiver, nullAddress, 6666)
        await truffleAssert.eventEmitted(result, 'Withdrawal', (ev) => {
            return (
                ev.value.toNumber() == 6666 &&
                ev.uid == "depositor UID" &&
                ev.tokenAddress == nullAddress
            )
        });
    });

    // Withdraw ERC20
    it('Withdraw ERC20', async function () {
        // depositing some tokens
        await clt.deposit(tentacleContract.address, 9999999999, {
            from: depositor
        })

        result = await deposit.withdraw("depositor UID", receiver, clt.address, 777777777)
        await truffleAssert.eventEmitted(result, 'Withdrawal', (ev) => {
            return (
                ev.value.toNumber() == 777777777 &&
                ev.uid == "depositor UID" &&
                ev.tokenAddress == clt.address
            )
        });
    });

    it('Payment in ETH', async function () {
        result = await deposit.receivePayment(nullAddress, 0, "purchaseId", {
            value: "1000000000000000000"
        })
        await truffleAssert.eventEmitted(result, 'Payment', (ev) => {
            return (
                ev.value.toString() == "1000000000000000000" &&
                ev.purchaseId == "purchaseId" &&
                ev.tokenAddress == nullAddress
            )
        });

        // deposit (core) should have the balance
        let coreBalance = await web3.eth.getBalance(deposit.address)
        assert.equal(coreBalance, 1000000000000000000)
    });

    it('Payment in ERC20', async function () {
        await clt.approve(deposit.address, 1000000, {
            from: depositor
        })

        result = await deposit.receivePayment(clt.address, 1000000, "purchaseId", {
            from: depositor
        })
        await truffleAssert.eventEmitted(result, 'Payment', (ev) => {
            return (
                ev.value.toString() == "1000000" &&
                ev.purchaseId == "purchaseId" &&
                ev.tokenAddress == clt.address
            )
        });

        cltBalance = await clt.balanceOf(deposit.address)
        assert.equal(cltBalance.toNumber(), 1000000)
    });
});