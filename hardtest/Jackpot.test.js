const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JACKToken", function () {
  let JACKToken;
  let jackToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    JACKToken = await ethers.getContractFactory("JACKToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    jackToken = await JACKToken.deploy(ethers.utils.parseUnits("1000000", 18));
    await jackToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await jackToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await jackToken.balanceOf(owner.address);
      expect(await jackToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await jackToken.transfer(addr1.address, 50);
      const addr1Balance = await jackToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await jackToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await jackToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await jackToken.balanceOf(owner.address);
      await expect(
        jackToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await jackToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint new tokens", async function () {
      await jackToken.mint(addr1.address, 100);
      expect(await jackToken.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should not allow non-owners to mint new tokens", async function () {
      await expect(
        jackToken.connect(addr1).mint(addr2.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});