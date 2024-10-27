const hre = require("hardhat");

// Check if JACKPOT_ADDRESS is set in the environment
const jackpotAddress = process.env.JACKPOT_CONTRACT_ADDRESS;

if (!jackpotAddress) {
  console.error("Error: JACKPOT_CONTRACT_ADDRESS environment variable is not set");
  process.exit(1);
}

async function main() {
  const [owner, testUser] = await hre.ethers.getSigners();
  
  console.log("Testing getJackpotBalance with user:", testUser.address);

  console.log("Using Jackpot address:", jackpotAddress);

  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.attach(jackpotAddress);

  try {
    console.log("Calling getJackpotBalance...");
    const balance = await jackpot.connect(testUser).getJackpotBalance();
    console.log(`Current Jackpot balance: ${hre.ethers.utils.formatUnits(balance, 18)} JACK`);
  } catch (error) {
    console.error('Error calling getJackpotBalance:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
