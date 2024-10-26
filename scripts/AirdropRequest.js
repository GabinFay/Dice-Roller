import React, { useState } from 'react';
import { ethers } from 'ethers';
import JACKTokenABI from '../abis/JACKToken.json';

const JACK_TOKEN_ADDRESS = 'YOUR_DEPLOYED_JACK_TOKEN_ADDRESS';
const AIRDROP_AMOUNT = ethers.utils.parseUnits('100', 18); // 100 JACK tokens

function AirdropRequest() {
  const [status, setStatus] = useState('');

  const requestAirdrop = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(JACK_TOKEN_ADDRESS, JACKTokenABI, signer);

        const tx = await contract.mint(await signer.getAddress(), AIRDROP_AMOUNT);
        setStatus('Airdrop request sent. Waiting for confirmation...');
        await tx.wait();
        setStatus('Airdrop of 100 JACK tokens successful!');
      } else {
        setStatus('Please install MetaMask to use this feature.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Airdrop failed. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={requestAirdrop}>Request 100 JACK Tokens Airdrop</button>
      <p>{status}</p>
    </div>
  );
}

export default AirdropRequest;