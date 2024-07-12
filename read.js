require("dotenv").config();
const { GasPrice } = require("@cosmjs/stargate");
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate");
const { DirectSecp256k1Wallet } = require("@cosmjs/proto-signing");
const { fromHex } = require("@cosmjs/encoding");

// Environment and API settings
const privateKey = process.env.PRIVATE_KEY;
const rpcEndpoint = "https://rpc.osmotest5.osmosis.zone";

// Token and contract details
const aUSDC =
  "ibc/1587E7B54FC9EFDA2350DC690EC2F9B9ECEB6FC31CF11884F9C0C5207ABE3921";
const osmoDenom = "uosmo";
const gasPriceString = `0.4${osmoDenom}`;
const wasmContractAddress =
  "osmo1vqgrchlfuymkjrzmrjznpam3xtzfemthzue43yt8l4ug046rtvwqarcl8r";

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

    // Query message from the osmosis contract
    const response = await client.queryContractSmart(wasmContractAddress, {
      get_stored_message: {},
    });
    console.log("Message from Osmosis contract:", response.message);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
