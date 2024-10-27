const hre = require("hardhat");
require('dotenv').config();

async function main() {
  // Get the contract owner's signer
  const [owner] = await hre.ethers.getSigners();

  // Get the deployed Jackpot contract address
  const jackpotAddress = process.env.JACKPOT_CONTRACT_ADDRESS;

  // Get the deployed JackToken contract address
  const jackTokenAddress = process.env.JACK_TOKEN_ADDRESS;

  // Attach to the existing Jackpot contract
  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.attach(jackpotAddress);

  // Attach to the existing JackToken contract
  const JackToken = await hre.ethers.getContractFactory("JACKToken");
  const jackToken = await JackToken.attach(jackTokenAddress);

  console.log("Jackpot contract address:", jackpot.address);
  console.log("JackToken contract address:", jackToken.address);

  // Set the initial jackpot balance to 10 Jack tokens
  const initialJackpot = hre.ethers.utils.parseEther("10");
  console.log("Setting initial jackpot to 10 Jack tokens...");

  // Approve the Jackpot contract to spend tokens
  const approveTx = await jackToken.connect(owner).approve(jackpot.address, initialJackpot);
  await approveTx.wait();
  console.log("Approval successful");

  // Initialize the jackpot
  const initTx = await jackpot.connect(owner).initializeJackpot();
  await initTx.wait();
  console.log("Jackpot initialized successfully!");

  // Set the new win probability to 1/3
  const newProbability = 3;
  console.log("Setting win probability to 1/3...");
  
  const probTx = await jackpot.connect(owner).setWinProbability(newProbability);
  await probTx.wait();
  console.log("Win probability updated successfully!");

  // Verify the new jackpot balance and probability
  const jackpotBalance = await jackpot.getJackpotBalance();
  const updatedProbability = await jackpot.getWinProbability();
  console.log("New jackpot balance:", hre.ethers.utils.formatEther(jackpotBalance), "Jack tokens");
  console.log("New win probability:", `1/${updatedProbability}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
