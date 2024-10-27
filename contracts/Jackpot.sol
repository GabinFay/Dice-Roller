// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {RandomNumberV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/RandomNumberV2Interface.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Jackpot
 * @notice A simple gambling contract that utilizes Flare's secure random number for determining winners.
 */
contract Jackpot is Ownable {
    RandomNumberV2Interface internal randomNumberGenerator;
    IERC20 public jackToken;

    uint256 public jackpotBalance;
    uint256 public entryFee;
    uint256 public winProbability;


    event RandomNumberGenerated(uint256 randomNumber, uint256 timestamp);
    event JackpotEntered(address player);
    event JackpotWon(address winner, uint256 amount);
    event ProbabilityChanged(uint256 newProbability);
    event EntryFeeChanged(uint256 newEntryFee);

    constructor(address _jackTokenAddress) Ownable(msg.sender) {
        randomNumberGenerator = ContractRegistry.getRandomNumberV2();
        jackToken = IERC20(_jackTokenAddress);
        entryFee = 1 ether; // 1 JACK token as entry fee (assuming 18 decimals)
        winProbability = 100; // 1/100 chance to win
    }

    function getSecureRandomNumber()
        internal
        view
        returns (uint256 randomNumber, bool isSecure, uint256 timestamp)
    {
        (randomNumber, isSecure, timestamp) = randomNumberGenerator.getRandomNumber();
        /* DO NOT USE THE RANDOM NUMBER IF isSecure=false. */
        require(isSecure, "Random number is not secure");
        /* Your custom RNG consumption logic. In this example the values are just returned. */
        return (randomNumber, isSecure, timestamp);
    }

    /**
     * @notice Enter the Jackpot game.
     * Players can enter by sending the exact entry fee.
     */
    function enterJackpot() external {
        require(jackToken.transferFrom(msg.sender, address(this), entryFee), "Token transfer failed");

        (uint256 randomNumber, bool isSecure, uint256 timestamp) = getSecureRandomNumber();

        emit RandomNumberGenerated(randomNumber, timestamp);

        if (randomNumber % winProbability == 0) {
            // Winner!
            uint256 prize = jackpotBalance + entryFee;
            jackpotBalance = 0;
            require(jackToken.transfer(msg.sender, prize), "Failed to send prize");
            emit JackpotWon(msg.sender, prize);
        } else {
            // No win, add to jackpot
            jackpotBalance += entryFee;
            emit JackpotEntered(msg.sender);
        }
    }



    /**
     * @notice Set the win probability.
     * @param _newProbability The new win probability (e.g., 100 for 1/100 chance)
     */
    function setWinProbability(uint256 _newProbability) external onlyOwner {
        require(_newProbability > 0, "Probability must be greater than 0");
        winProbability = _newProbability;
        emit ProbabilityChanged(_newProbability);
    }

    /**
     * @notice Set the entry fee.
     * @param _newEntryFee The new entry fee in wei
     */
    function setEntryFee(uint256 _newEntryFee) external onlyOwner {
        require(_newEntryFee > 0, "Entry fee must be greater than 0");
        entryFee = _newEntryFee;
        emit EntryFeeChanged(_newEntryFee);
    }

    /**
     * @notice Get the current Jackpot balance.
     * @return The current Jackpot balance in wei
     */
    function getJackpotBalance() external view returns (uint256) {
        return jackpotBalance;
    }

    /**
     * @notice Get the current entry fee.
     * @return The current entry fee in JACK tokens (with 1 decimal)
     */
    function getEntryFee() external view returns (uint256) {
        return entryFee;
    }

    /**
     * @notice Get the current win probability.
     * @return The current win probability (e.g., 100 for 1/100 chance)
     */
    function getWinProbability() external view returns (uint256) {
        return winProbability;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(jackToken.transfer(owner(), amount), "Token transfer failed");
    }
}
