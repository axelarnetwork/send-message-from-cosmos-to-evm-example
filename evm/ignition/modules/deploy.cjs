// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('SendReceiveModule', (m) => {
  const GATEWAY = '0xC249632c2D40b9001FE907806902f63038B737Ab';
  const GAS_SERVICE = '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6';
  const CHAIN_NAME = 'Avalanche';
  const SendReceive = m.contract('SendReceive', [
    GATEWAY,
    GAS_SERVICE,
    CHAIN_NAME,
  ]);
  return { SendReceive };
});
