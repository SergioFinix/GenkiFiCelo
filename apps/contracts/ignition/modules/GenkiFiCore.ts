// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const GenkiFiModule = buildModule("GenkiFiCoreModule", (m) => {
  
  const genkiFiCore = m.contract("GenkiFiCore", [], {
    
  });

  return { genkiFiCore };
});

export default GenkiFiModule;
