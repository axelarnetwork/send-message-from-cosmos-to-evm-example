require('dotenv').config();
const { GasPrice } = require('@cosmjs/stargate');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');

const rpcEndpoint = 'https://rpc.osmotest5.osmosis.zone';
const osmoDenom = 'uosmo';
const gasPriceString = `0.4${osmoDenom}`;
const wasmContractAddress =
  'osmo1nr7p004vkczdaczx50gyhh39xmuj37y6gtcn9rs56nq70dq2eqqs6chjp2';

const getSigner = async () => {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) {
    console.error('Mnemonic not found in environment variables.');
    process.exit(1);
  }

  return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: 'osmo',
  });
};

(async () => {
  try {
    const signer = await getSigner();
    const accounts = await signer.getAccounts();
    const senderAddress = accounts[0].address;
    console.log('Sender Address:', senderAddress);

    const gasPrice = GasPrice.fromString(gasPriceString);
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      signer,
      { gasPrice }
    );

    const balanceOsmo = await client.getBalance(senderAddress, osmoDenom);
    console.log('----- Wallet Info -----');
    console.log(`Wallet address: ${senderAddress}`);
    console.log(`Osmo balance: ${balanceOsmo.amount / 1e6} OSMO\n`);

    if (balanceOsmo.amount < 1e6) {
      console.error('Insufficient OSMO balance to pay for gas fee');
      return process.exit(0);
    }

    const payload = {
      send_message_agoric: {
        destination_channel: 'channel-10241',
        destination_address:
          'agoric1h2w0ca85wmjrpee9skwvrt8d2a85jjnh6r3wcvy25asxckhqh7nqjgp3jy',
        message: 'Hi from Osmosis',
      },
    };

    const funds = [
      {
        denom: osmoDenom,
        amount: '100000',
      },
    ];

    console.log('Sending message to Osmosis contract...');

    const result = await client.execute(
      senderAddress,
      wasmContractAddress,
      payload,
      'auto',
      undefined,
      funds
    );

    console.log('Sent:', result.transactionHash);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
