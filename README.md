Let's improve the documentation further by adding more details, organizing sections better, and ensuring clarity throughout the process.

# Send Message from Cosmos to EVM

This project demonstrates how to send a message from Osmosis to Avalanche.

## Prerequisites

### 1. Install `osmosisd` CLI

Download and install the `osmosisd` CLI by following the instructions [here](https://docs.osmosis.zone/osmosis-core/osmosisd).

If the installation wizard does not work, build from source using the following commands:

```bash
git clone https://github.com/osmosis-labs/osmosis.git
cd osmosis
make build
```

### 2. Create a Wallet

If you don't have a wallet yet, create one using the following command:

```bash
osmosisd keys add wallet
```

### 3. Obtain Test Tokens

Get some test tokens from the Osmosis Testnet Faucet: [Osmosis Testnet Faucet](https://faucet.testnet.osmosis.zone/)

## Deploy the Contract

### 1. Build the Contract

Navigate to the `wasm` folder and build the contract using Docker:

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.13
```

### 2. Upload and Initialize the Contract

#### Upload the Contract

Use the following command to upload the contract:

```bash
osmosisd tx wasm store ./artifacts/send_receive.wasm --from wallet --gas-prices 0.4uosmo --gas auto --gas-adjustment 1.5 -y -b sync --output json --node https://rpc.osmotest5.osmosis.zone:443 --chain-id osmo-test-5
```

#### Initialize the Contract

Instantiate the contract with this command:

```bash
osmosisd tx wasm instantiate <codeId> '{"channel":"channel-4118"}' --from wallet --label "send_receive" --gas-prices 0.1uosmo --gas auto --gas-adjustment 1.3 --no-admin -y -b sync --output json
```

Replace `<codeId>` with the actual code ID of your transaction. To find the code ID, check [Mintscan](https://www.mintscan.io/) and replace `<codeId>` accordingly.

### 3. Create `.env` File

Navigate to the root folder and create a `.env` file:

```bash
touch .env
```

Add the private key of your EVM address to the `.env` file:

```
PRIVATE_KEY="your private key"
```

### 4. Run the Script

Run the script using the following command:

```bash
node index.js
```

## Useful Resources

- [Osmosis Testnet Faucet](https://faucet.testnet.osmosis.zone/)
- [Osmosis Testnet Explorer](https://mintscan.io/osmosis-testnet)

### Notes

- Ensure you have Docker installed for building the contract.
- Replace placeholder values (e.g., `<codeId>`, `"your private key"`) with actual values specific to your setup.
- For any issues during the deployment or execution, refer to the official documentation or community forums for support.
