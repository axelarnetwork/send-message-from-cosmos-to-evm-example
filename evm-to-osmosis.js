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
const contractAddress = '0xD8D2D41974069C1c79d33bd339dBD5c6941Bd80f';
const contractABI = [
  `function send(
    string calldata destinationChain, 
    string calldata destinationChannel,
    string calldata destinationAgoricAddress,
    string calldata destinationAddress, 
    string calldata message
  ) external payable`,
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = getSigner().connect(provider);
const contract = new ethers.Contract(contractAddress, contractABI, signer);

const sendMessage = async ({
  destinationChain,
  destinationChannel,
  destinationAgoricAddress,
  destinationAddress,
  message,
}) => {
  try {
    const tx = await contract.send(
      destinationChain,
      destinationChannel,
      destinationAgoricAddress,
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
  destinationChannel: 'channel-10241',
  destinationAddress:
    'osmo158xxa5mwqe5ehnjmx2nwa2gmlep3wqfufnr7aapw2cga4v6tp60qwt28sy',
  destinationAgoricAddress:
    'agoric1h2w0ca85wmjrpee9skwvrt8d2a85jjnh6r3wcvy25asxckhqh7nqjgp3jy',
  message: 'Hello from Avalanche',
});
