import React from 'react';
import Web3Provider from "web3-react";
import connectors from "./Connectors.js";
import Initialize from "./pages/Initialize.js";
import Routes from './routes';

function App() {
  return (
    <Web3Provider connectors={connectors} libraryName="ethers.js">
      <Routes />
    </Web3Provider>
  )
}

export default App;
