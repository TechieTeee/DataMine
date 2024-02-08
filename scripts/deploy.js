const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = hre.ethers.parseEther("0.001");

  // Replace "Lock" with "DataMine" in the deployContract function
  const dataMine = await hre.ethers.deployContract("DataMine", [unlockTime], {
    value: lockedAmount,
  });

  await dataMine.waitForDeployment();

  console.log(
    `DataMine with ${ethers.utils.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${dataMine.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
