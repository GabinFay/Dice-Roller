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

  // Get the current entry fee
  const entryFee = await jackpot.entryFee();
  console.log("Entry fee:", hre.ethers.utils.formatEther(entryFee), "JACK");

  // Approve the Jackpot contract to spend JACK tokens
  const approveTx = await jackToken.connect(player).approve(jackpotAddress, entryFee);
  await approveTx.wait();
  console.log("Approved Jackpot contract to spend JACK tokens");

  // Request airdrop
  console.log("Requesting airdrop...");
  const airdropTx = await jackpot.connect(player).requestAirdrop();
  await airdropTx.wait();
  console.log("Airdrop of 100 JACK tokens received");

  // Get player's JACK token balance
  const playerBalance = await jackToken.balanceOf(player.address);
  console.log("Player's JACK token balance:", hre.ethers.utils.formatEther(playerBalance), "JACK");

  // Roll the dice (enter Jackpot)
  console.log("Rolling the dice...");
  const rollTx = await jackpot.connect(player).enterJackpot();
  const receipt = await rollTx.wait();

  // Check for events in the transaction receipt
  const jackpotWonEvent = receipt.events?.find(e => e.event === "JackpotWon");
  const jackpotEnteredEvent = receipt.events?.find(e => e.event === "JackpotEntered");

  if (jackpotWonEvent) {
    console.log("Congratulations! You won the roll!");
    const [winner, amount] = jackpotWonEvent.args;
    console.log("Winner:", winner);
    console.log("Amount won:", hre.ethers.utils.formatEther(amount), "JACK");
  } else if (jackpotEnteredEvent) {
    console.log("You lost the roll. Better luck next time!");
  } else {
    console.log("Something unexpected happened. Check the transaction receipt for details.");
  }

  // Get the updated Jackpot balance
  const jackpotBalance = await jackpot.getJackpotBalance();
  console.log("Current Jackpot balance:", hre.ethers.utils.formatEther(jackpotBalance), "JACK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
