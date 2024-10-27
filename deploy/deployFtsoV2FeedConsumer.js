const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying FtsoV2FeedConsumer contract with the account:", deployer.address);

  // Deploy FtsoV2FeedConsumer contract
  const FtsoV2FeedConsumer = await hre.ethers.getContractFactory("FtsoV2FeedConsumer");
  const ftsoV2FeedConsumer = await FtsoV2FeedConsumer.deploy();
  await ftsoV2FeedConsumer.deployed();

  console.log("FtsoV2FeedConsumer deployed to:", ftsoV2FeedConsumer.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
