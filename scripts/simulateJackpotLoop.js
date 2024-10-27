const hre = require("hardhat");
const readline = require('readline');
// import { ethers } from "hardhat";


async function main() {
  // Get the second account from the Hardhat config
  const [owner, player] = await hre.ethers.getSigners();

  console.log("Player address:", player.address);

  // Get the deployed Jackpot contract
  const jackpotAddress = process.env.JACKPOT_CONTRACT_ADDRESS;
  const jackTokenAddress = process.env.JACK_TOKEN_ADDRESS;

  const JACKToken = await hre.ethers.getContractFactory("JACKToken");
  const jackToken = await JACKToken.attach(jackTokenAddress);

  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.attach(jackpotAddress);

  console.log("Contract address:", jackpot.address);
  console.log("Available functions:", Object.keys(jackpot.functions));

  // Set the entry fee to 1 ether
  const newEntryFee = hre.ethers.utils.parseEther("1");
  await jackpot.connect(owner).setEntryFee(newEntryFee);
  console.log("Entry fee set to:", hre.ethers.utils.formatEther(newEntryFee), "JACK");

  // Set the probability to 1/3
  await jackpot.connect(owner).setWinProbability(3); // 1/3 chance
  console.log("Win probability set to 1/3");

  let hasWon = false;
  let attempts = 0;

  while (!hasWon) {
    attempts++;
    console.log(`\nAttempt #${attempts}`);

    // Approve the Jackpot contract to spend JACK tokens
    const approveTx = await jackToken.connect(player).approve(jackpotAddress, newEntryFee);
    await approveTx.wait();
    console.log("Approved Jackpot contract to spend JACK tokens");

    // Enter the Jackpot
    console.log("Entering the Jackpot...");
    const enterTx = await jackpot.connect(player).enterJackpot();
    const receipt = await enterTx.wait();

    // Find the RandomNumberGenerated event
    const randomNumberEvent = receipt.events?.find(e => e.event === "RandomNumberGenerated");
    if (randomNumberEvent) {
      const [randomNumber, timestamp] = randomNumberEvent.args;
      console.log("Random number:", randomNumber % 3);
      console.log("Timestamp:", timestamp.toString());
    } else {
      console.log("RandomNumberGenerated event not found");
    }

    // Check for JackpotWon or JackpotEntered events
    const jackpotWonEvent = receipt.events?.find(e => e.event === "JackpotWon");
    const jackpotEnteredEvent = receipt.events?.find(e => e.event === "JackpotEntered");

    if (jackpotWonEvent) {
      console.log("Congratulations! You won the Jackpot!");
      const [winner, amount] = jackpotWonEvent.args;
      console.log("Winner:", winner);
      console.log("Amount won:", hre.ethers.utils.formatEther(amount), "JACK");
      hasWon = true;
    } else if (jackpotEnteredEvent) {
      console.log("You entered the Jackpot, but didn't win this time.");
    } else {
      console.log("Something unexpected happened. Check the transaction receipt for details.");
    }

    // Get the updated Jackpot balance
    const jackpotBalance = await jackpot.getJackpotBalance();
    console.log("Current Jackpot balance:", hre.ethers.utils.formatEther(jackpotBalance), "JACK");
  }

  console.log(`\nTotal attempts before winning: ${attempts}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
