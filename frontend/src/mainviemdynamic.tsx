import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createConfig, WagmiProvider } from 'wagmi'
import { config } from './config.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const queryClient = new QueryClient()

// Add this configuration object

const evmNetworks = [
  {
    blockExplorerUrls: ['https://coston2-explorer.flare.network'],
    chainId: 114,
    chainName: 'Flare Coston2',
    iconUrls: ['https://flare.xyz/wp-content/uploads/2021/11/flare-logo.svg'],
    name: 'Flare',
    nativeCurrency: {
      decimals: 18,
      name: 'Coston2 Flare',
      symbol: 'C2FLR',
      iconUrl: 'https://flare.xyz/wp-content/uploads/2021/11/flare-logo.svg',
    },
    networkId: 114,
    rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
    vanityName: 'Flare Coston2',
  },
  {
    blockExplorerUrls: ['https://coston-explorer.flare.network'],
    chainId: 14,
    chainName: 'Flare Coston',
    iconUrls: ['https://flare.xyz/wp-content/uploads/2021/11/flare-logo.svg'],
    name: 'Flare',
    nativeCurrency: {
      decimals: 18,
      name: 'Coston Flare',
      symbol: 'CFLR',
      iconUrl: 'https://flare.xyz/wp-content/uploads/2021/11/flare-logo.svg',
    },
    networkId: 14,
    rpcUrls: ['https://coston-api.flare.network/ext/C/rpc'],
    vanityName: 'Flare Coston',
  },
];

  

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || '',
        walletConnectors: [EthereumWalletConnectors],
        overrides: {evmNetworks},
      }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <App />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider> 
    </DynamicContextProvider>
  </React.StrictMode>,
)
