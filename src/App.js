import React, { useState } from 'react';
import Web3Provider from "web3-react";
import connectors from "./Connectors.js";
import Initialize from "./pages/Initialize.js";
import { Router } from 'react-router-dom';
import history from './services/history';
import Routes from './routes';

function App() {
  return (
    <Web3Provider connectors={connectors} libraryName="ethers.js">
      <Router history={history}>
        <Routes />
      </Router>
    </Web3Provider>
  )
}

export default App;
