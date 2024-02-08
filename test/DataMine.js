const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("DataMine", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearDataMineFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const DataMine = await ethers.getContractFactory("DataMine");
    const dataMine = await DataMine.deploy(unlockTime, { value: lockedAmount });

    return { dataMine, unlockTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { dataMine, unlockTime } = await loadFixture(deployOneYearDataMineFixture);

      expect(await dataMine.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { dataMine, owner } = await loadFixture(deployOneYearDataMineFixture);

      expect(await dataMine.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to lock", async function () {
      const { dataMine, lockedAmount } = await loadFixture(
        deployOneYearDataMineFixture
      );

      expect(await ethers.provider.getBalance(dataMine.address)).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const DataMine = await ethers.getContractFactory("DataMine");
      await expect(DataMine.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlock time should be in the future"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { dataMine } = await loadFixture(deployOneYearDataMineFixture);

        await expect(dataMine.withdraw()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { dataMine, unlockTime, otherAccount } = await loadFixture(
          deployOneYearDataMineFixture
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use dataMine.connect() to send a transaction from another account
        await expect(dataMine.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { dataMine, unlockTime } = await loadFixture(
          deployOneYearDataMineFixture
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(dataMine.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { dataMine, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearDataMineFixture
        );

        await time.increaseTo(unlockTime);

        await expect(dataMine.withdraw())
          .to.emit(dataMine, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { dataMine, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearDataMineFixture
        );

        await time.increaseTo(unlockTime);

        await expect(dataMine.withdraw()).to.changeEtherBalances(
          [owner, dataMine],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});
