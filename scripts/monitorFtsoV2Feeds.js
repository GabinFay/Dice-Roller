const hre = require("hardhat");
const readline = require('readline');

async function main() {
  // Get the deployed FtsoV2FeedConsumer contract
  const ftsoV2FeedConsumerAddress = process.env.FTSOV2_FEED_CONSUMER_ADDRESS_TEST;
  
  const FtsoV2FeedConsumer = await hre.ethers.getContractFactory("FtsoV2FeedConsumer");
  const ftsoV2FeedConsumer = await FtsoV2FeedConsumer.attach(ftsoV2FeedConsumerAddress);

  console.log("FtsoV2FeedConsumer address:", ftsoV2FeedConsumer.address);

  // Function to fetch and display feed values
  async function fetchAndDisplayFeedValues() {
    const [feedValues, decimals, timestamp] = await ftsoV2FeedConsumer.getFtsoV2CurrentFeedValues();
    
    console.log("\nCurrent FTSO V2 Feed Values:");
    console.log("Timestamp:", new Date(timestamp * 1000).toLocaleString());
    
    const feedIds = [
      "FLR/USD",
      "BTC/USD",
      "ETH/USD"
    ];

    feedValues.forEach((value, index) => {
      const decimalValue = value / (10 ** decimals[index]);
      console.log(`${feedIds[index]}: ${decimalValue.toFixed(decimals[index])}`);
    });
  }

  // Initial fetch
  await fetchAndDisplayFeedValues();

  // Set up readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Function to prompt user
  function promptUser() {
    rl.question('Press Enter to fetch latest values or type "exit" to quit: ', async (answer) => {
      if (answer.toLowerCase() === 'exit') {
        rl.close();
        process.exit(0);
      } else {
        await fetchAndDisplayFeedValues();
        promptUser();
      }
    });
  }

  // Start prompting user
  promptUser();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});