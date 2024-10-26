const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy JACKToken
  const JACKToken = await hre.ethers.getContractFactory("JACKToken");
  const initialSupply = hre.ethers.utils.parseUnits("1000000", 1); // 1 million JACK tokens, integer
  const jackToken = await JACKToken.deploy(initialSupply);
  await jackToken.deployed();

  console.log("JACKToken deployed to:", jackToken.address);

  // Deploy your Lottery contract
  // Assuming you have a Lottery contract, replace "Lottery" with your actual contract name
  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.deploy(jackToken.address);
  await jackpot.deployed();

  console.log("Jackpot deployed to:", jackpot.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });