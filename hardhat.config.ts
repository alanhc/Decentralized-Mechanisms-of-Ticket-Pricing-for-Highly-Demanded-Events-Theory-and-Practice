import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter"
import "./tasks/faucet"

import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
const config: any = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.ETH_SK]
    },
    polygon_mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.ETH_SK]
    },
    hardhat: {
      chainId: 31337,
    },
    // hardhat: {
    //   accounts: [SEPOLIA_PRIVATE_KEY],
    //   chainId: 1337
    // },
  },
  allowUnlimitedContractSize: true,
  gasReporter: {
    enabled: true,
    showTimeSpent: true,
    coinmarketcap: "395b536d-3831-4b35-ba3a-3716c5c98c38",
  },

};

export default config;
