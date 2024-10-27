import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// import * as ethers from 'ethers';
console.log('Ethers:', ethers);
import JackpotABI from './json/JackpotABI.json';
import logo from './assets/logo.svg';
import './AnimatedBackground.css';
import confetti from 'canvas-confetti';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const FLARE_COSTON2_RPC = 'https://coston2-api.flare.network/ext/C/rpc';
const FLARE_COSTON2_CHAIN_ID = 114;
const OWNER_PRIVATE_KEY = import.meta.env.VITE_OWNER_PRIVATE_KEY || '';

function App() {
  const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userProvider, setUserProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [userContract, setUserContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [jackpotBalance, setJackpotBalance] = useState<string>('0');
  const [entryFee, setEntryFee] = useState<string>('0');
  const [winProbability, setWinProbability] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRollResult, setLastRollResult] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProvider = async () => {
      const provider = new ethers.providers.JsonRpcProvider(FLARE_COSTON2_RPC);
      setProvider(provider);

      const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
      const jackpotContract = new ethers.Contract(CONTRACT_ADDRESS, JackpotABI, wallet);
      setContract(jackpotContract);

      await updateJackpotInfo(jackpotContract);
    };

    initializeProvider();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleChainChanged = async (chainId: string) => {
    // Reset user-specific state
    setUserProvider(null);
    setUserContract(null);
    setAccount(null);

    if (parseInt(chainId, 16) === FLARE_COSTON2_CHAIN_ID) {
      setNetworkError(null);
      await connectWallet();
    } else {
      setNetworkError("Please connect to the Flare Coston2 testnet");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        
        const network = await web3Provider.getNetwork();
        if (network.chainId !== FLARE_COSTON2_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${FLARE_COSTON2_CHAIN_ID.toString(16)}` }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: `0x${FLARE_COSTON2_CHAIN_ID.toString(16)}`,
                      chainName: 'Flare Coston2 Testnet',
                      nativeCurrency: {
                        name: 'Coston2 Flare',
                        symbol: 'C2FLR',
                        decimals: 18
                      },
                      rpcUrls: [FLARE_COSTON2_RPC],
                      blockExplorerUrls: ['https://coston2-explorer.flare.network/'],
                    },
                  ],
                });
              } catch (addError) {
                throw new Error("Failed to add the Flare Coston2 network");
              }
            } else {
              throw new Error("Failed to switch to the Flare Coston2 network");
            }
          }
        }

        setUserProvider(web3Provider);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const userJackpotContract = new ethers.Contract(CONTRACT_ADDRESS, JackpotABI, signer);
        setUserContract(userJackpotContract);

        setNetworkError(null);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setNetworkError("Failed to connect wallet. Please try again.");
      }
    } else {
      setNetworkError("Please install MetaMask or another Web3 wallet");
    }
  };

  const updateJackpotInfo = async (jackpotContract: ethers.Contract) => {
    try {
      const balance = await jackpotContract.getJackpotBalance();
      setJackpotBalance(ethers.utils.formatEther(balance));

      const fee = await jackpotContract.getEntryFee();
      setEntryFee(ethers.utils.formatEther(fee));

      const probability = await jackpotContract.getWinProbability();
      setWinProbability(probability.toNumber());
    } catch (error) {
      console.error("Error updating jackpot info:", error);
    }
  };

  const rollDice = async () => {
    if (!userContract) return;
    try {
      setIsRolling(true);
      const tx = await userContract.enterJackpot();
      const receipt = await tx.wait();
      
      const winEvent = receipt.events?.find((event: any) => event.event === 'JackpotWon');
      if (winEvent) {
        setLastRollResult('You won!');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setLastRollResult('You lost. Try again!');
      }
      
      await updateJackpotInfo(contract!);
    } catch (error) {
      console.error('Error rolling dice:', error);
      if (error.code === 'NETWORK_ERROR') {
        setNetworkError("Network changed. Please reconnect your wallet.");
        setUserProvider(null);
        setUserContract(null);
        setAccount(null);
      } else {
        alert('Error rolling dice. Please try again.');
      }
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="animated-background"></div>
      <div className="relative z-10 min-h-screen text-white flex flex-col items-center justify-start p-4 w-full">
        <img src={logo} alt="Jackpot Logo" className="absolute top-8 left-8 w-20 h-20" />
        <h1 className="text-6xl font-bold mb-16 text-yellow-400 mt-5">Jackpot</h1>
        <div className="rounded-lg max-w-4xl w-full">
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-3xl font-semibold text-white">Current Jackpot:</h2>
            <p className="text-4xl font-bold text-green-400">{jackpotBalance} JACK</p>
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
            {!account ? (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-xl"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            ) : (
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-lg font-bold text-xl"
                onClick={rollDice}
                disabled={isRolling}
              >
                {isRolling ? 'Rolling...' : `Roll the Dice (${entryFee} JACK)`}
              </button>
            )}
            {lastRollResult && (
              <p className="text-2xl font-bold mt-4">{lastRollResult}</p>
            )}
          </div>
        </div>
        {account && (
          <div className="mt-4 p-4 bg-black bg-opacity-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Connected Address:</h3>
            <p className="font-mono text-sm break-all">{account}</p>
          </div>
        )}
        {networkError && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
            {networkError}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
