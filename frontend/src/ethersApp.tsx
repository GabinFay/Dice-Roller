import React, { useState, useEffect } from 'react'
import FallingCoin from './components/UI/FallingCoin'
import JackpotABI from './json/JackpotABI.json'
import lastWinnerData from './json/lastWinner.json'
import lotteryInfoData from './json/lotteryInfo.json'
import { useEnsName } from 'wagmi'
import logo from './assets/logo.svg'
import './AnimatedBackground.css';

const INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;

if (!INFURA_API_KEY) {
  console.error("Infura API key is not set in the .env file");
}

import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { ethers } from 'ethers'
import confetti from 'canvas-confetti'
import { Chain } from 'viem'

export const flare = {
  id: 14,
  name: 'Flare Mainnet',
  nativeCurrency: { name: 'Flare', symbol: 'FLR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://flare-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Flare Explorer', url: 'https://flare-explorer.flare.network' },
  },
} as const satisfies Chain

export const flareCoston2 = {
  id: 114,
  name: 'Coston2',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
  testnet: true,
} as const satisfies Chain

// Replace the hardcoded CONTRACT_ADDRESS with:
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

if (!CONTRACT_ADDRESS) {
  console.error("Contract address is not set in the .env file");
}

const SUPPORTED_NETWORKS = {
  FLARE_MAINNET: flare.id,
  FLARE_COSTON2: flareCoston2.id,
}

function App() {
  const [jackpotBalance, setJackpotBalance] = useState<string>('0')
  const [entryFee, setEntryFee] = useState<string>('0')
  const [winProbability, setWinProbability] = useState<number>(0)
  const [lastWinner, setLastWinner] = useState<string>('')
  const [lastWinAmount, setLastWinAmount] = useState<string>('0')
  const [ticketCount, setTicketCount] = useState<number>(1)
  const [fallingCoins, setFallingCoins] = useState<{ id: number; left: number }[]>([])
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const {  primaryWallet } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const { setShowAuthFlow, handleLogOut, user } = useDynamicContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false)
  const [lastRollResult, setLastRollResult] = useState<string | null>(null)
  const [currentChain, setCurrentChain] = useState<Chain | null>(null);

  useEffect(() => {
    const init = async () => {
      if (isLoggedIn && primaryWallet && isEthereumWallet(primaryWallet)) {
        await setUpEthers()
      }
    }
    init()

    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdNumber = parseInt(chainId, 16);
        console.log("Connected to chain ID:", chainIdNumber);
        
        let newChain: Chain | null = null;
        if (chainIdNumber === flare.id) {
          newChain = flare;
        } else if (chainIdNumber === flareCoston2.id) {
          newChain = flareCoston2;
        }
        
        if (newChain) {
          console.log("Connected to supported network:", newChain.name);
          setCurrentChain(newChain);
          await setUpEthers();
        } else {
          console.error("Connected to unsupported network. Please switch to Flare Coston2.");
          alert('Please connect to the Flare Coston2 network to interact with the contract.');
        }
      }
    };

    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, [isLoggedIn, primaryWallet])

  const setUpEthers = async () => {
    console.log("Setting up ethers...");
    console.log("Contract address:", CONTRACT_ADDRESS);

    if (!window.ethereum) {
      console.error("No Ethereum provider found");
      alert('Please install MetaMask or another Ethereum wallet to interact with this dApp.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      console.log("Connected to network:", network.name);
      console.log("Network ID:", network.chainId);

      if (network.chainId !== flareCoston2.id) {
        console.error("Not connected to Flare Coston2. Please switch to the correct network.");
        alert('Please connect to the Flare Coston2 network to interact with the contract.');
        return;
      }

      const jackpotContract = new ethers.Contract(CONTRACT_ADDRESS, JackpotABI, signer);
      
      console.log("Contract object:", jackpotContract);
      
      if (!jackpotContract) {
        throw new Error("Failed to initialize contract object");
      }

      console.log("Contract set up successfully");
      
      setContract(jackpotContract);
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);
      await updateJackpotInfo(jackpotContract);
    } catch (error) {
      console.error("Error setting up ethers:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
  }

  const updateJackpotInfo = async (jackpotContract: ethers.Contract) => {
    try {
      console.log("Updating jackpot info...");

      console.log("Calling getJackpotBalance...");
      const balance = await jackpotContract.getJackpotBalance();
      console.log("Jackpot balance:", balance);
      setJackpotBalance(ethers.utils.formatEther(balance));

      console.log("Calling getEntryFee...");
      const fee = await jackpotContract.getEntryFee();
      console.log("Entry fee:", fee);
      setEntryFee(ethers.utils.formatEther(fee));

      console.log("Calling getWinProbability...");
      const probability = await jackpotContract.getWinProbability();
      console.log("Win probability:", probability);
      setWinProbability(probability.toNumber());

      console.log("Jackpot info updated successfully");
    } catch (error) {
      console.error("Error updating jackpot info:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
    }
  }

  const isSupportedNetwork = () => {
    return currentChain !== null;
  };

  const adjustTicketCount = (amount: number) => {
    setPrevTicketCount(ticketCount);
    setTicketCount((prev) => Math.max(1, prev + amount));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150); // Reset after 0.1 seconds
    if (amount > 0) {
      const coinCount = Math.floor(Math.random() * 4) + 1;
      const newCoins = Array.from({ length: coinCount }, () => ({
        id: Date.now() + Math.random(),
        left: Math.random() * window.innerWidth,
      }));
      setFallingCoins((prevCoins) => [...prevCoins, ...newCoins]);
    }
  };

  const removeCoin = (id: number) => {
    setFallingCoins((prevCoins) => prevCoins.filter((coin) => coin.id !== id));
  };

  const { data: winnerEnsName } = useEnsName({
    address: lastWinner as `0x${string}`,
  })

  const requestAirdrop = async () => {
    if (!contract) {
      console.error("Contract is not initialized");
      alert('Error: Contract is not initialized. Please make sure you are connected to the correct network.');
      return;
    }
    if (!isSupportedNetwork()) {
      alert('Please connect to a supported network (Flare Coston or Flare Coston2) to request an airdrop.');
      return;
    }
    try {
      console.log("Requesting airdrop...");
      const tx = await contract.requestAirdrop();
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      alert('100 JACK tokens have been airdropped to your account!');
      updateJackpotInfo(contract);
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      if (error.message) {
        alert(`Error requesting airdrop: ${error.message}`);
      } else {
        alert('Error requesting airdrop. Please check the console for more details.');
      }
    }
  }

  const rollDice = async () => {
    if (!contract || !signer) return
    if (!isSupportedNetwork()) {
      alert('Please connect to a supported network (Flare Coston or Flare Coston2) to play.')
      return
    }
    try {
      setIsRolling(true)
      
      // Get the user's address
      const address = await signer.getAddress()
      
      // Get the current entry fee
      const entryFeeWei = await contract.getEntryFee()
      
      // Check JACK token balance
      const jackBalance = await contract.balanceOf(address)
      if (jackBalance.lt(entryFeeWei)) {
        alert(`Insufficient JACK balance. You need at least ${ethers.utils.formatEther(entryFeeWei)} JACK to play.`)
        return
      }

      // Check allowance
      const allowance = await contract.allowance(address, CONTRACT_ADDRESS)
      if (allowance.lt(entryFeeWei)) {
        console.log("Insufficient allowance. Requesting approval...")
        const approveTx = await contract.approve(CONTRACT_ADDRESS, entryFeeWei)
        await approveTx.wait()
        console.log("Approval transaction confirmed")
      }

      console.log("Entering jackpot...")
      const tx = await contract.enterJackpot()
      const receipt = await tx.wait()
      
      const winEvent = receipt.events?.find((event: any) => event.event === 'JackpotWon')
      if (winEvent) {
        setLastRollResult('You won!')
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } else {
        setLastRollResult('You lost. Try again!')
      }
      
      updateJackpotInfo(contract)
    } catch (error) {
      console.error('Error rolling dice:', error)
      if (error.message.includes('ERC20InsufficientAllowance')) {
        alert('Error: Insufficient allowance. Please try again.')
      } else {
        alert('Error rolling dice. Please check the console for more details.')
      }
    } finally {
      setIsRolling(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="animated-background"></div>
      <div className="relative z-10 min-h-screen text-white flex flex-col items-center justify-start p-4 w-full">
        <img src={logo} alt="Jackpot Logo" className="absolute top-8 left-8 w-20 h-20" />
        <div className="absolute top-8 right-8">
          <DynamicWidget />
        </div>
        <h1 className="text-6xl font-bold mb-16 text-yellow-400 mt-5">Jackpot</h1>
        <div className="rounded-lg max-w-4xl w-full">
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-white">Current Jackpot:</h2>
            <p className="text-4xl font-bold text-green-400">
              {jackpotBalance} JACK
            </p>
          </div>
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-white">Entry Fee:</h2>
            <p className="text-4xl font-bold text-yellow-400">{entryFee} JACK</p>
          </div>
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-white">Win Probability:</h2>
            <p className="text-4xl font-bold text-yellow-400">1 in {winProbability}</p>
          </div>
          <div className="mt-12 flex flex-col items-center justify-center space-y-4 p-10 bg-black bg-opacity-50">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-xl"
              onClick={requestAirdrop}
            >
              Request 100 JACK Tokens
            </button>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold text-xl"
              onClick={rollDice}
              disabled={!isConnected || !isSupportedNetwork() || isRolling}
            >
              {isRolling ? 'Rolling...' : `Roll the Dice (${entryFee} JACK)`}
            </button>
            {lastRollResult && (
              <p className="text-2xl font-bold mt-4">{lastRollResult}</p>
            )}
          </div>
          <div className="text-center p-6 bg-black bg-opacity-50">
            <h2 className="text-3xl font-semibold mb-6">Last Winner</h2>
            <p className="text-green-400 font-mono text-3xl mb-3">
              {winnerEnsName || lastWinner}
            </p>
            <p className="text-yellow-400 font-mono text-3xl">
              Won: {lastWinAmount} JACK
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Remove the AppWithDynamicContext wrapper and export App directly
export default App;
