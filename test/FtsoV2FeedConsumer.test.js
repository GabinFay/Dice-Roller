const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FtsoV2FeedConsumer", function () {
  let ftsoV2FeedConsumer;

  before(async function () {
    // Deploy the FtsoV2FeedConsumer contract
    const FtsoV2FeedConsumer = await ethers.getContractFactory("FtsoV2FeedConsumer");
    ftsoV2FeedConsumer = await FtsoV2FeedConsumer.deploy();
    await ftsoV2FeedConsumer.deployed();
    console.log("FtsoV2FeedConsumer deployed to:", ftsoV2FeedConsumer.address);
  });

  it("should return feed values, decimals, and timestamp", async function () {
    const result = await ftsoV2FeedConsumer.getFtsoV2CurrentFeedValues();

    // Destructure the result
    const [feedValues, decimals, timestamp] = result;

    console.log("\n--- getFtsoV2CurrentFeedValues Result ---");
    console.log("Feed Values:");
    feedValues.forEach((value, index) => {
      console.log(`  Feed ${index + 1}: ${ethers.utils.formatUnits(value, 18)}`);
    });

    console.log("\nDecimals:");
    decimals.forEach((decimal, index) => {
      console.log(`  Feed ${index + 1}: ${decimal}`);
    });

    console.log("\nTimestamp:", new Date(timestamp * 1000).toISOString());

    // Check that the returned arrays have the expected length (3 feeds)
    expect(feedValues.length).to.equal(3);
    expect(decimals.length).to.equal(3);

    // Check that feedValues are non-zero (assuming the mock always returns non-zero values)
    feedValues.forEach(value => {
      expect(value.gt(0)).to.be.true;
    });

    // Check that decimals are within a reasonable range (e.g., between -18 and 18)
    decimals.forEach(decimal => {
      expect(decimal).to.be.at.least(-18).and.at.most(18);
    });

    // Check that the timestamp is a recent Unix timestamp (within the last hour)
    const currentTime = Math.floor(Date.now() / 1000);
    expect(timestamp).to.be.at.least(currentTime - 3600).and.at.most(currentTime);
  });
});
