require('dotenv').config();
const { GasPrice } = require('@cosmjs/stargate');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { AxelarQueryAPI } = require('@axelar-network/axelarjs-sdk');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { fromHex } = require('@cosmjs/encoding');

// Environment and API settings
const mnemonic = process.env.MNEMONIC;
const rpcEndpoint = 'https://rpc.osmotest5.osmosis.zone';
const chainId = 'osmosis-7';
const testnetEnvironment = 'testnet';

// Token and contract details
const aUSDC =
  'ibc/1587E7B54FC9EFDA2350DC690EC2F9B9ECEB6FC31CF11884F9C0C5207ABE3921'; // aUSDC IBC address
const osmoDenom = 'uosmo';
const gasPriceString = `0.4${osmoDenom}`;
const wasmContractAddress =
  'osmo1lh6wpvmwmvtn04el2veamxytvmfqluxqjs364a06fxg37yhn3qhs7ckzp2';

// Message details
const destinationChain = 'Avalanche';
const destinationAddress = '0x758efcd3E3C2BA17B87D0Be5F7f42531E456fa07';
const messageToSend = 'increment';

// Create Wallet

(async () => {
  try {
    // Create a wallet
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'osmo',
    });

    const accounts = await wallet.getAccounts();
    const address = accounts[0].address;
    console.log('Sender Address:', address);

    // Connect to the client
    const gasPrice = GasPrice.fromString(gasPriceString);
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      { gasPrice }
    );

    // Retrieve balances
    const balanceUsdc = await client.getBalance(address, aUSDC);
    const balanceOsmo = await client.getBalance(address, osmoDenom);

    // Log wallet information
    console.log('----- Wallet Info -----');
    console.log(`Wallet address: ${address}`);
    console.log(`aUSDC balance: ${balanceUsdc.amount / 1e6} aUSDC`);
    console.log(`Osmo balance: ${balanceOsmo.amount / 1e6} OSMO\\n`);

    // Estimate gas fee
    const api = new AxelarQueryAPI({ environment: testnetEnvironment });
    const gasAmount = await api.estimateGasFee(
      chainId,
      destinationChain,
      100000,
      'auto',
      'aUSDC'
    );
    console.log(`Estimated gas fee: ${parseInt(gasAmount) / 1e6} aUSDC`);

    // Check for sufficient balances
    if (balanceUsdc.amount < gasAmount) {
      console.error('Insufficient aUSDC balance to pay for gas fee');
      return process.exit(0);
    }

    if (balanceOsmo.amount < 1e6) {
      console.error('Insufficient OSMO balance to pay for gas fee');
      return process.exit(0);
    }

    const response = await client.queryContractSmart(wasmContractAddress, {
      get_stored_message: {},
    });
    console.log('Message from Osmosis contract:', response.message);

    // Prepare payload to send message to osmosis contract
    const payload = {
      send_message_evm: {
        destination_chain: destinationChain,
        destination_address: destinationAddress,
        message: messageToSend,
      },
    };

    const fee = {
      amount: gasAmount,
      denom: aUSDC,
    };

    console.log('Sending message to Osmosis contract...');

    // Execute transaction
    const result = await client.execute(
      address,
      wasmContractAddress,
      payload,
      'auto',
      undefined,
      [fee]
    );

    console.log('Sent:', result.transactionHash);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
