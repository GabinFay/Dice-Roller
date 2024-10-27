const hre = require("hardhat");

const dotenv = require('dotenv');

dotenv.config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying Jackpot contract with the account:", deployer.address);

  // Address of the already deployed JACKToken
  const jackTokenAddress = process.env.JACK_TOKEN_ADDRESS;

  // Deploy Jackpot contract
  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.deploy(jackTokenAddress);
  await jackpot.deployed();

  console.log("Jackpot deployed to:", jackpot.address);
    }
    
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
