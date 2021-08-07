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
    this.cliffDuration = time.duration.years(1);
    this.duration = time.duration.years(2);
  });

  it('reverts with a duration shorter than the cliff', async function () {
    const cliffDuration = this.duration;
    const duration = this.cliffDuration;

    expect(cliffDuration).to.be.bignumber.that.is.at.least(duration);

    await expectRevert(
      TokenVesting.new(owner, beneficiary, this.start, cliffDuration, duration, {
        from: owner
      }),
      'TokenVesting: cliff is longer than duration'
    );
  });

  it('reverts with a null beneficiary', async function () {
    await expectRevert(
      TokenVesting.new(owner, ZERO_ADDRESS, this.start, this.cliffDuration, this.duration, {
        from: owner
      }),
      'TokenVesting: beneficiary is the zero address'
    );
  });

  it('reverts with a null duration', async function () {
    // cliffDuration should also be 0, since the duration must be larger than the cliff
    await expectRevert(
      TokenVesting.new(owner, beneficiary, this.start, 0, 0, {
        from: owner
      }), 'TokenVesting: duration is 0'
    );
  });

  it('reverts if the end time is in the past', async function () {
    const now = await time.latest();

    this.start = now.sub(this.duration).sub(time.duration.minutes(1));
    await expectRevert(
      TokenVesting.new(owner, beneficiary, this.start, this.cliffDuration, this.duration, {
        from: owner
      }),
      'TokenVesting: final time is before current time'
    );
  });

  context('once deployed', function () {
    beforeEach(async function () {

      this.token = await CulteToken.new({
        from: owner
      });

      this.vesting = await TokenVesting.new(
        this.token.address, beneficiary, this.start, this.cliffDuration, this.duration, {
          from: owner
        });


      await this.token.transfer(this.vesting.address, amount, {
        from: owner
      });
    });

    it('can get state', async function () {
      expect(await this.vesting.beneficiary()).to.equal(beneficiary);
      expect(await this.vesting.cliff()).to.be.bignumber.equal(this.start.add(this.cliffDuration));
      expect(await this.vesting.start()).to.be.bignumber.equal(this.start);
      expect(await this.vesting.duration()).to.be.bignumber.equal(this.duration);
    });

    it('cannot be released before cliff', async function () {
      await expectRevert(this.vesting.release(),
        'TokenVesting: no tokens are due'
      );
    });

    it('can be released after cliff', async function () {
      await time.increaseTo(this.start.add(this.cliffDuration).add(time.duration.weeks(1)));
      const { logs } = await this.vesting.release();
      expectEvent.inLogs(logs, 'TokensReleased', {
        amount: await this.token.balanceOf(beneficiary),
      });
    });

    it('should release proper amount after cliff', async function () {
      await time.increaseTo(this.start.add(this.cliffDuration));

      await this.vesting.release();
      const releaseTime = await time.latest();

      const releasedAmount = amount.mul(releaseTime.sub(this.start)).div(this.duration);
      expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(releasedAmount);
      expect(await this.vesting.released()).to.be.bignumber.equal(releasedAmount);
    });

    it('should linearly release tokens during vesting period', async function () {
      const vestingPeriod = this.duration.sub(this.cliffDuration);
      const checkpoints = 4;

      for (let i = 1; i <= checkpoints; i++) {
        const now = this.start.add(this.cliffDuration).add((vestingPeriod.muln(i).divn(checkpoints)));
        await time.increaseTo(now);

        await this.vesting.release();
        const expectedVesting = amount.mul(now.sub(this.start)).div(this.duration);
        expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(expectedVesting);
        expect(await this.vesting.released()).to.be.bignumber.equal(expectedVesting);
      }
    });

    it('should have released all after end', async function () {
      await time.increaseTo(this.start.add(this.duration));
      await this.vesting.release();
      expect(await this.token.balanceOf(beneficiary)).to.be.bignumber.equal(amount);
      expect(await this.vesting.released()).to.be.bignumber.equal(amount);
    });

    function vestedAmount(total, now, start, cliffDuration, duration) {
      return (now.lt(start.add(cliffDuration))) ? new BN(0) : total.mul((now.sub(start))).div(duration);
    }
  });
});