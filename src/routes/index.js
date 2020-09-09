import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Initialize from '../pages/Initialize';
import RandomBeaconEntries from '../pages/RandomBeaconEntries';
import RandomBeaconGroups from '../pages/RandomBeaconGroups';
import { useWeb3Context } from "web3-react";
import { HashRouter } from 'react-router-dom';
import Header from '../components/Header';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export default function Routes() {
  const context = useWeb3Context();

  return (
    <div>
      <Header />
      <br/>
      {!context.active && (
      <Container>
        <Button variant="primary" onClick={() => context.setConnector('Metamask')}>
            Connect with Metamask
        </Button>
      </Container>)}
      {context.active && <HashRouter>
        <Route path="/" exact component={Initialize} />
        <Route path="/random-beacon/entries" component={RandomBeaconEntries} />
        <Route path="/random-beacon/groups" component={RandomBeaconGroups} />
      </HashRouter>}
    </div>
  );
}
