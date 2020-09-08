import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Initialize from '../pages/Initialize';
import RandomBeacon from '../pages/RandomBeacon';
import { useWeb3Context } from "web3-react";
import { HashRouter } from 'react-router-dom';

export default function Routes() {
  const context = useWeb3Context();

  return (
    <div>
      {!context.active && (
      <button onClick={() => context.setConnector('Metamask')}>
          Connect with Metamask
      </button>)}
      {context.active && <HashRouter>
        <Route path="/" exact component={Initialize} />
        <Route path="/random-beacon" component={RandomBeacon} />
      </HashRouter>}
    </div>
  );
}
