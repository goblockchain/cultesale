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

const CulteToken = artifacts.require('CulteToken');
const ExchangeVesting = artifacts.require('ExchangeVesting');

contract("ExchangeVesting", async accounts => {
  const amount = new BN('1000');
  const beneficiary = accounts[1];
  const owner = accounts[2];

  beforeEach(async function () {
    // +1 minute so it starts after contract instantiation
    this.start = (await time.latest()).add(time.duration.minutes(1));
  });

  it('reverts with a null beneficiary', async function () {
    await expectRevert(
      ExchangeVesting.new(owner, ZERO_ADDRESS, {
        from: owner
      }),
      'ExchangeVesting: beneficiary is the zero address'
    );
  });

  context('once deployed', function () {
    beforeEach(async function () {

      this.token = await CulteToken.new({
        from: owner
      });

      this.vesting = await ExchangeVesting.new(
        this.token.address, beneficiary, {
          from: owner
        });


      await this.token.transfer(this.vesting.address, amount, {
        from: owner
      });
    });

    it('can get state', async function () {
      expect(await this.vesting.beneficiary()).to.equal(beneficiary);
      expect(await this.vesting.released()).to.be.bignumber.equal(new BN(0));
    });

    it('should release proper amount', async function () {
      await time.increaseTo(this.start.add(time.duration.minutes(1)));

      let receipt = await this.vesting.release(900, {
        from: owner
      });

      const releasedAmount = receipt.logs[0].args.amount;
      expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(releasedAmount);
      expect(await this.vesting.released()).to.be.bignumber.equal(releasedAmount);
      expect(await this.token.balanceOf(this.vesting.address)).to.be.bignumber.equal(new BN(amount - releasedAmount));
    });

    it('should not release more than the current balance', async function () {
      await expectRevert(this.vesting.release(1100, {
        from: owner
      }),
        'ExchangeVesting: amount overflows the balance'
      );
    });

  });
});