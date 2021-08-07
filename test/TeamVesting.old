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

const CulteSaleMock = artifacts.require("CulteSaleMock");
const CulteToken = artifacts.require("CulteToken");
const TeamVesting = artifacts.require('TeamVesting');

contract("TeamVesting", async accounts => {
  const amount = new BN('10000');
  const beneficiary = accounts[1];
  const owner = accounts[2];

  beforeEach(async function () {
    // +1 minute so it starts after contract instantiation
    duration = time.duration.years(2);
  });

  it('reverts with a null beneficiary', async function () {
    await expectRevert(
      TeamVesting.new(owner, owner, ZERO_ADDRESS, duration, {
        from: owner
      }),
      'TeamVesting: beneficiary is the zero address'
    );
  });

  it('reverts with a null duration', async function () {
    // cliffDuration should also be 0, since the duration must be larger than the cliff
    await expectRevert(
      TeamVesting.new(owner, owner, beneficiary, 0, {
        from: owner
      }), 'TeamVesting: duration is 0'
    );
  });

  context('once deployed', function () {
    beforeEach(async function () {


      clt = await CulteToken.new();

      sale = await CulteSaleMock.new();

      vesting = await TeamVesting.new(
        clt.address, sale.address, beneficiary, duration, {
          from: owner
        });


      await clt.transfer(vesting.address, amount);
    });

    it('can get state', async function () {
      expect(await vesting.beneficiary()).to.equal(beneficiary);
      expect(await vesting.duration()).to.be.bignumber.equal(duration);
    });

    it('cannot be released before sales', async function () {
      await expectRevert(vesting.release(),
        'TeamVesting: no tokens are due'
      );
    });

    it('should release proper amount during sales', async function () {
      // await time.increaseTo(this.start.add(this.cliffDuration));

      // setting total sold to 10%
      await sale.setTotal("4200000000000000000000000");

      await vesting.release();

      let releasedAmount = "1000" // (10%)
      expect(await clt.balanceOf(beneficiary)).to.be.bignumber.equal(releasedAmount);
      expect(await vesting.released()).to.be.bignumber.equal(releasedAmount);

      // setting total sold to 50%
      await sale.setTotal("21000000000000000000000000");

      await vesting.release();

      releasedAmount = "5000" // (10%)
      expect(await clt.balanceOf(beneficiary)).to.be.bignumber.equal(releasedAmount);
      expect(await vesting.released()).to.be.bignumber.equal(releasedAmount);

      // setting total sold to 100%
      await sale.setTotal("42000000000000000000000000");

      await vesting.release();

      releasedAmount = "10000" // (10%)
      expect(await clt.balanceOf(beneficiary)).to.be.bignumber.equal(releasedAmount);
      expect(await vesting.released()).to.be.bignumber.equal(releasedAmount);
    });

    it('should return the non-vested tokens when revoked by owner', async function () {
      // setting total sold to 50%
      await sale.setTotal("21000000000000000000000000");

      await vesting.revoke({
        from: owner
      });

      expect(await clt.balanceOf(owner)).to.be.bignumber.equal("5000"); //50%
    });

    it('should keep the vested tokens when revoked by owner', async function () {

      // setting total sold to 60%
      await sale.setTotal("25200000000000000000000000");

      await vesting.revoke({
        from: owner
      });

      expect(await clt.balanceOf(vesting.address)).to.be.bignumber.equal("6000"); //60%
    });

    it('only owner can revoke', async function () {

      // setting total sold to 60%
      await sale.setTotal("25200000000000000000000000");

      await expectRevert(
        vesting.revoke({
          from: beneficiary
        }),
        'Ownable: caller is not the owner'
      );

      expect(await clt.balanceOf(vesting.address)).to.be.bignumber.equal(amount); //100%, 
    });

  });
});