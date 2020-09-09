import React, { useState } from 'react';
import connectors from "../Connectors.js";
import { Link } from 'react-router-dom';
import { useWeb3Context } from "web3-react";
import Header from '../components/Header';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function Initialize(props) {
  const context = useWeb3Context();

  if (context.error) {
    console.error("Error!");
  }
  else {
  return (
    <React.Fragment>
      <Header />
      <Container>
        {context.active && (
          <p>Connected with {context.connectorName} on network {context.networkId}!</p>
        )}
        {context.active && context.account && (
            <p>Connected account is: {context.account}</p>
        )}
        {context.error && <p>Something went wrong.  Please try connecting to your Web3 provider again.</p>}
        {context.active && (
          <Button variant="secondary" onClick={() => context.unsetConnector()}>
            Reset Web3 Connection
          </Button>
        )}
      </Container>
    </React.Fragment>
  );
  }
  
}   

export default Initialize;
