const hre = require("hardhat");

// Check if JACKPOT_ADDRESS is set in the environment
const jackpotAddress = process.env.JACKPOT_CONTRACT_ADDRESS;

if (!jackpotAddress) {
  console.error("Error: JACKPOT_ADDRESS environment variable is not set");
  process.exit(1);
}

async function main() {
  const [owner, testUser] = await hre.ethers.getSigners();
  
  console.log("Airdrop request script started by:", testUser.address);

  console.log("Using Jackpot address:", jackpotAddress);

  const Jackpot = await hre.ethers.getContractFactory("Jackpot");
  const jackpot = await Jackpot.attach(jackpotAddress);

  const JACKToken = await hre.ethers.getContractFactory("JACKToken");
  const jackToken = await JACKToken.attach(await jackpot.jackToken());

  try {
    console.log(`Attempting to request airdrop for ${testUser.address}...`);

    const initialBalance = await jackToken.balanceOf(testUser.address);
    console.log(`Initial balance of recipient: ${hre.ethers.utils.formatUnits(initialBalance, 18)} JACK`);

    const tx = await jackpot.connect(testUser).requestAirdrop();
    console.log('Airdrop request transaction sent. Waiting for confirmation...');
    await tx.wait();

    const newBalance = await jackToken.balanceOf(testUser.address);
    console.log(`New balance of recipient: ${hre.ethers.utils.formatUnits(newBalance, 18)} JACK`);

    console.log('Airdrop request successful!');
  } catch (error) {
    console.error('Error during airdrop request:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
