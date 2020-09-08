import React, { useState } from 'react';
import connectors from "../Connectors.js";
import { Link } from 'react-router-dom';
import { useWeb3Context } from "web3-react";
import Header from '../components/Header';

function Initialize(props) {
  const context = useWeb3Context();

  if (context.error) {
    console.error("Error!");
  }
  else {
  return (
    <React.Fragment>
      <Header />
      <h2>Keep Tools</h2>
      {context.active && (
        <button onClick={() => context.unsetConnector()}>
          Reset Web3 Connection
          </button>
      )}
      {context.active && (
        <p>Connected with {context.connectorName} on network {context.networkId}!</p>
      )}
      {context.active && context.account && (
          <p>Connected account is: {context.account}</p>
      )}
      {context.error && <p>Something went wrong.  Please try connecting to your Web3 provider again.</p>}
    </React.Fragment>
  );
  }
  
}   

export default Initialize;
