
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
// import Web3ContextProvider from "../context/Web3Context";
import { MetaMaskUIProvider } from '@metamask/sdk-react-ui';

import { sepolia } from 'wagmi/chains'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { Web3Modal } from '@web3modal/react';
import { EthereumClient } from '@web3modal/ethereum';
// import { WagmiConfig } from 'wagmi'
let chains:any = [sepolia]
const projectId = 'ce0cb9232cf0da5feaf0645784ef736d'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
createWeb3Modal({ wagmiConfig, projectId, chains })
const ethereumClient = new EthereumClient(wagmiConfig, chains)
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig config={wagmiConfig}>
        <Component {...pageProps} />
      </WagmiConfig>

      {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
 */}

    </ChakraProvider>

  )

}
