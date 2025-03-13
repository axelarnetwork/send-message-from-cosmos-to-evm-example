// @ts-check
require('dotenv').config();
const { Wallet, ethers } = require('ethers');

const getSigner = () => {
  const senderPrivateKey = process.env.PRIVATE_KEY;
  if (!senderPrivateKey) {
    console.error('Private key not found in environment variables.');
    process.exit(1);
  }
  return new Wallet(senderPrivateKey);
};

const RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
const contractAddress = '0x5A3A4B354FDc3723db3eDFf2Fd1D2F6a85739b06';
const contractABI = [
  'function send(string calldata destinationChain, string calldata destinationAddress, string calldata message) external payable',
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = getSigner().connect(provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

const sendMessage = async ({
  destinationChain,
  destinationAddress,
  message,
}) => {
  try {
    const tx = await contract.send(
      destinationChain,
      destinationAddress,
      message,
      {
        value: ethers.utils.parseEther('0.01'),
        gasLimit: 500000 + 500000 + 464129 + 464129,
      }
    );

    console.log('Transaction Hash:', tx.hash);
    await tx.wait();
    console.log('Transaction Confirmed!');
  } catch (error) {
    console.error('Error:', error);
  }
};

sendMessage({
  destinationChain: 'osmosis-7',
  destinationAddress:
    'osmo1nr7p004vkczdaczx50gyhh39xmuj37y6gtcn9rs56nq70dq2eqqs6chjp2',
  message: 'Hello from Avalanche',
});
