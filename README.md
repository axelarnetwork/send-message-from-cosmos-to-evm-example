# Osmosis Send Receive Contract

This is a simple script to send message from osmosis to avalanche

## Prerequisites

1. Get osmosisd CLI from [here](https://docs.osmosis.zone/osmosis-core/osmosisd)

You may need to build from source if the wizard does not work.

```
git clone https://github.com/osmosis-labs/osmosis.git
cd osmosis
make build
sudo cp build/osmosisd /usr/local/bin
```

2. Copy `.osmosisd/client.toml` to `~/.osmosisd/client.toml`
3. Create a Wallet

```bash
osmosisd keys add wallet
```

4. Get some test tokens

Go to the faucet and get some test tokens: https://faucet.testnet.osmosis.zone/

## Deploy contract

### 1. Build the contract

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.13
```

### 2. Upload and init the contract

```bash
osmosisd tx wasm store ./artifacts/send_receive.wasm --from wallet --gas-prices 0.4uosmo --gas auto --gas-adjustment 1.5 -y -b sync --output json
```

Check the codeId on mintscan, and replace the codeId in the following command

```bash
osmosisd tx wasm instantiate <codeId> '{"channel":"channel-4118"}' --from wallet --label "send_receive" --gas-prices 0.1uosmo --gas auto --gas-adjustment 1.3 --no-admin -y -b sync --output json
```

### 3. Create .env

```
MNEMONIC="your mnemonic"
```

### 4. Run the script

```bash
node index.js
```

# Useful Resources

- Faucet: https://faucet.testnet.osmosis.zone/
- Explorer: https://mintscan.io/osmosis-testnet
