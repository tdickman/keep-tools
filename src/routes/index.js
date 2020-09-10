import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Initialize from '../pages/Initialize';
import RandomBeaconEntries from '../pages/RandomBeaconEntries';
import RandomBeaconGroups from '../pages/RandomBeaconGroups';
import RandomBeaconGroupDetails from '../pages/RandomBeaconGroupDetails';
import { useWeb3Context } from "web3-react";
import { HashRouter } from 'react-router-dom';
import Header from '../components/Header';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { SUPPORTED_NETWORKS } from '../config'

export default function Routes() {
  const context = useWeb3Context();

  return (
    <div>
      <Header />
      <br/>
      {!context.active && (
      <Container>
        <div style={{
                  position: 'absolute', left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)'
              }}>
          <div style={{display: 'flex', justifyContent: 'center', paddingBottom: '10px'}}>
            <Button variant="primary" onClick={() => context.setConnector('Metamask')}>
              Connect with Metamask
            </Button>
          </div>
          <p style={{textAlign: 'center'}}>Please make sure you have metamask installed and set to the ropsten network</p>
        </div>
      </Container>)}
      {context.active && SUPPORTED_NETWORKS.indexOf(context.networkId) === -1 &&
        <p>Make sure you are on ropsten network</p>
      }
      {context.active && <HashRouter>
        <Route path="/" exact component={Initialize} />
        <Route path="/random-beacon/entries" exact component={RandomBeaconEntries} />
        <Route path="/random-beacon/groups" exact component={RandomBeaconGroups} />
        <Route path="/random-beacon/groups/:blockNumber" exact component={RandomBeaconGroupDetails} />
      </HashRouter>}
    </div>
  );
}
