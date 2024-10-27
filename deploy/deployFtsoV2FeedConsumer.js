const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying FtsoV2FeedConsumer contract with the account:", deployer.address);

  // Deploy FtsoV2FeedConsumer contract
  const FtsoV2FeedConsumer = await hre.ethers.getContractFactory("FtsoV2FeedConsumer");
  const ftsoV2FeedConsumer = await FtsoV2FeedConsumer.deploy();
  await ftsoV2FeedConsumer.deployed();

  console.log("FtsoV2FeedConsumer deployed to:", ftsoV2FeedConsumer.address);

  // Verify contract on block explorer (if not on a local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await ftsoV2FeedConsumer.deployTransaction.wait(5);

    await hre.run("verify:verify", {
      address: ftsoV2FeedConsumer.address,
      contract: "contracts/FtsoV2FeedConsumer.sol:FtsoV2FeedConsumer",
    });
    console.log("FtsoV2FeedConsumer contract verified on block explorer");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
