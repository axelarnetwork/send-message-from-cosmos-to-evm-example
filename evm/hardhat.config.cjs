require('@nomicfoundation/hardhat-toolbox');
const { config } = require('dotenv');
config();

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) {
  throw Error('PRIVATE_KEY is not added as a secret');
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  defaultNetwork: 'hardhat',
  etherscan: {
    apiKey: {
      fuji: "snowtrace", // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: "fuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
          browserURL: "https://avalanche.testnet.localhost:8080"
        }
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    // https://build.avax.network/docs/dapps/toolchains/hardhat#hardhat-config
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    base: {
      url: 'https://sepolia.base.org/',
      gasPrice: 225000000000,
      chainId: 84532,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  mocha: {
    timeout: 20000,
  },
};
