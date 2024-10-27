const hre = require("hardhat");

async function main() {
  // Get the contract owner's signer
  const [owner] = await hre.ethers.getSigners();

  // Get the deployed Jackpot contract address
  const jackpotAddress = process.env.JACKPOT_CONTRACT_ADDRESS;

  // Attach to the existing Jackpot contract
  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.attach(jackpotAddress);

  console.log("Jackpot contract address:", jackpot.address);

  // Set the new win probability to 1/3
  const newProbability = 3;
  console.log("Setting win probability to 1/3...");
  
  const tx = await jackpot.connect(owner).setWinProbability(newProbability);
  await tx.wait();

  console.log("Win probability updated successfully!");

  // Verify the new probability
  const updatedProbability = await jackpot.getWinProbability();
  console.log("New win probability:", `1/${updatedProbability}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
