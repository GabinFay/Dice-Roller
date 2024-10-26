const hre = require("hardhat");
const readline = require('readline');

const JACK_TOKEN_ADDRESS = 'YOUR_DEPLOYED_JACK_TOKEN_ADDRESS'; // Replace with your actual deployed address
const AIRDROP_AMOUNT = hre.ethers.utils.parseUnits('100', 18); // 100 JACK tokens

async function main() {
  const [owner] = await hre.ethers.getSigners();
  
  console.log("Airdrop script started by:", owner.address);

  const JACKToken = await hre.ethers.getContractFactory("JACKToken");
  const jackToken = await JACKToken.attach(JACK_TOKEN_ADDRESS);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the recipient address for the airdrop: ', async (recipientAddress) => {
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

    rl.close();
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });