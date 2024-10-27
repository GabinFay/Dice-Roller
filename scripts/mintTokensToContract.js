const hre = require("hardhat");

const jackTokenAddress = process.env.JACK_TOKEN_ADDRESS;
const jackpotContractAddress = process.env.JACKPOT_CONTRACT_ADDRESS;
const MINT_AMOUNT = hre.ethers.utils.parseUnits('1000000', 18); // 1 million JACK tokens with 18 decimals

async function main() {
  const [owner] = await hre.ethers.getSigners();
  
  console.log("Minting script started by:", owner.address);

  const JACKToken = await hre.ethers.getContractFactory("JACKToken");
  const jackToken = await JACKToken.attach(jackTokenAddress);

  try {
    console.log(`Attempting to mint 1,000,000 JACK tokens to Jackpot contract at ${jackpotContractAddress}...`);

    const initialBalance = await jackToken.balanceOf(jackpotContractAddress);
    console.log(`Initial balance of Jackpot contract: ${hre.ethers.utils.formatUnits(initialBalance, 18)} JACK`);

    const tx = await jackToken.mint(jackpotContractAddress, MINT_AMOUNT);
    console.log('Minting transaction sent. Waiting for confirmation...');
    await tx.wait();

    const newBalance = await jackToken.balanceOf(jackpotContractAddress);
    console.log(`New balance of Jackpot contract: ${hre.ethers.utils.formatUnits(newBalance, 18)} JACK`);

    console.log('Minting successful!');
  } catch (error) {
    console.error('Error during minting:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });