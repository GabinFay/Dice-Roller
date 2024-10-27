const hre = require("hardhat");
const readline = require('readline');

const jackTokenAddress = process.env.JACK_TOKEN_ADDRESS;
const AIRDROP_AMOUNT = hre.ethers.utils.parseUnits('100', 18); // 100 JACK tokens with 18 decimals

async function main() {
  const [owner] = await hre.ethers.getSigners();
  
  console.log("Airdrop script started by:", owner.address);

  const JACKToken = await hre.ethers.getContractFactory("JACKToken");
  const jackToken = await JACKToken.attach(jackTokenAddress);

  const recipientAddress = "0x123f5d42850E980510dC09239Af8064a324e9e6a";

  try {
    console.log(`Attempting to airdrop 100 JACK tokens to ${recipientAddress}...`);

    const initialBalance = await jackToken.balanceOf(recipientAddress);
    console.log(`Initial balance of recipient: ${hre.ethers.utils.formatUnits(initialBalance, 18)} JACK`);

    const tx = await jackToken.mint(recipientAddress, AIRDROP_AMOUNT);
    console.log('Airdrop transaction sent. Waiting for confirmation...');
    await tx.wait();

    const newBalance = await jackToken.balanceOf(recipientAddress);
    console.log(`New balance of recipient: ${hre.ethers.utils.formatUnits(newBalance, 18)} JACK`);

    console.log('Airdrop successful!');
  } catch (error) {
    console.error('Error during airdrop:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
