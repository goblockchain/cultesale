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
const TokenVesting = artifacts.require('CulteVesting');

contract("CulteVesting", async accounts => {
  const amount = new BN('1000');
  const beneficiary = accounts[1];
  const owner = accounts[2];

  beforeEach(async function () {
    // +1 minute so it starts after contract instantiation
    this.start = (await time.latest()).add(time.duration.minutes(1));
  });

  it('reverts with a null beneficiary', async function () {
    await expectRevert(
      TokenVesting.new(owner, ZERO_ADDRESS, this.start, {
        from: owner
      }),
      'TokenVesting: beneficiary is the zero address'
    );
  });

  it('reverts with a null start date', async function () {
    await expectRevert(
      TokenVesting.new(owner, beneficiary, 0, {
        from: owner
      }), 'TokenVesting: start date is zero'
    );
  });

  context('once deployed', function () {
    beforeEach(async function () {

      this.token = await CulteToken.new({
        from: owner
      });

      this.vesting = await TokenVesting.new(
        this.token.address, beneficiary, this.start, {
          from: owner
        });


      await this.token.transfer(this.vesting.address, amount, {
        from: owner
      });
    });

    it('can get state', async function () {
      expect(await this.vesting.beneficiary()).to.equal(beneficiary);
      expect(await this.vesting.nextRelease()).to.be.bignumber.equal(this.start);
    });

    it('cannot be released before next release date', async function () {
      await expectRevert(this.vesting.release(),
        'TokenVesting: no tokens available yet'
      );
    });

    it('should release proper amount', async function () {
      await time.increaseTo(this.start.add(time.duration.minutes(1)));

      let receipt = await this.vesting.release();

      const releasedAmount = receipt.logs[0].args.amount;
      expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(releasedAmount);
      expect(await this.vesting.released()).to.be.bignumber.equal(releasedAmount);
    });

    it('should linearly release tokens during vesting period', async function () {
      let now = this.start.add(time.duration.days(31));
      let expectedVesting = new BN(0);
      let shouldContinue = true;

      while(shouldContinue) {
        let vestingAmount = (await this.token.balanceOf(this.vesting.address)).toNumber();
        if(vestingAmount == 0) {
          break;
        }
        
        now = now.add(time.duration.days(31));
        await time.increaseTo(now);
        
        let receipt = await this.vesting.release();
        expectedVesting = expectedVesting.add(new BN(receipt.logs[0].args.amount.toNumber()));
        expect(await this.vesting.released()).to.be.bignumber.equal(expectedVesting);
      }
      expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(amount);
      expect(await this.vesting.released()).to.be.bignumber.equal(amount);
    });
  });
});