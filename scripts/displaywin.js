const hre = require("hardhat");

// Check if JACKPOT_ADDRESS is set in the environment
const jackpotAddress = process.env.JACKPOT_CONTRACT_ADDRESS;

if (!jackpotAddress) {
  console.error("Error: JACKPOT_CONTRACT_ADDRESS environment variable is not set");
  process.exit(1);
}

async function main() {
  const [owner] = await hre.ethers.getSigners();
  
  console.log("Win probability display script started by:", owner.address);

  console.log("Using Jackpot address:", jackpotAddress);

  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.attach(jackpotAddress);

  try {
    console.log("Fetching current win probability...");

    const winProbability = await jackpot.getWinProbability();
    
    // Convert the win probability to a percentage
    const winProbabilityPercentage = (winProbability.toNumber() / 10000) * 100;

    console.log(`Current win probability: ${winProbabilityPercentage.toFixed(2)}%`);
  } catch (error) {
    console.error('Error fetching win probability:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });