import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Initialize from '../pages/Initialize';
import RandomBeacon from '../pages/RandomBeacon';
import { useWeb3Context } from "web3-react";
import { HashRouter } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function Routes() {
  const context = useWeb3Context();

  return (
    <div>
      {!context.active && (
      <Button variant="primary" onClick={() => context.setConnector('Metamask')}>
          Connect with Metamask
      </Button>)}
      {context.active && <HashRouter>
        <Route path="/" exact component={Initialize} />
        <Route path="/random-beacon" component={RandomBeacon} />
      </HashRouter>}
    </div>
  );
}
