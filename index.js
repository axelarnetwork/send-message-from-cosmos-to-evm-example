require("dotenv").config();
const { GasPrice } = require("@cosmjs/stargate");
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const { AxelarQueryAPI } = require("@axelar-network/axelarjs-sdk");
const { DirectSecp256k1Wallet } = require("@cosmjs/proto-signing");
const { fromHex } = require("@cosmjs/encoding");

// Environment and API settings
const privateKey = process.env.PRIVATE_KEY;
const rpcEndpoint = "https://rpc.osmotest5.osmosis.zone";
const chainId = "osmosis-7";
const testnetEnvironment = "testnet";

// Token and contract details
const aUSDC =
  "ibc/1587E7B54FC9EFDA2350DC690EC2F9B9ECEB6FC31CF11884F9C0C5207ABE3921";
const osmoDenom = "uosmo";
const gasPriceString = `0.4${osmoDenom}`;
const wasmContractAddress =
  "osmo1ag9qw9t7r2yz3crjkk8su8e2yleyl540muelf5h7cyu3dg99fmcsn4an0c";

// Message details
const destinationChain = "Avalanche";
const destinationAddress = "0x64e4eBcD2fC55C0dC3841771fd6AfA77d6932801"; // Avalanche address
const messageToSend = "Hello from Osmosis!";

(async () => {
  try {
    // Decode the private key from hex
    const decodedPrivateKey = fromHex(privateKey);

    // Create a wallet from the private key
    const wallet = await DirectSecp256k1Wallet.fromKey(
      decodedPrivateKey,
      "osmo"
    );
    const [{ address }] = await wallet.getAccounts();

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
    console.log("----- Wallet Info -----");
    console.log(`Wallet address: ${address}`);
    console.log(`aUSDC balance: ${balanceUsdc.amount / 1e6} aUSDC`);
    console.log(`Osmo balance: ${balanceOsmo.amount / 1e6} OSMO\n`);

    // Estimate gas fee
    const api = new AxelarQueryAPI({ environment: testnetEnvironment });
    const gasAmount = await api.estimateGasFee(
      chainId,
      destinationChain,
      100000,
      "auto",
      "aUSDC"
    );
    console.log(`Estimated gas fee: ${parseInt(gasAmount) / 1e6} aUSDC`);

    // Check for sufficient balances
    if (balanceUsdc.amount < gasAmount) {
      console.error("Insufficient aUSDC balance to pay for gas fee");
      return process.exit(0);
    }

    if (balanceOsmo.amount < 1e6) {
      console.error("Insufficient OSMO balance to pay for gas fee");
      return process.exit(0);
    }

    // Query message from the osmosis contract
    const response = await client.queryContractSmart(wasmContractAddress, {
      get_stored_message: {},
    });
    console.log("Message from Osmosis contract:", response.message);

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

    console.log("Sending message to Osmosis contract...");

    // Execute transaction
    const result = await client.execute(
      address,
      wasmContractAddress,
      payload,
      "auto",
      undefined,
      [fee]
    );

    console.log("Sent:", result.transactionHash);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
