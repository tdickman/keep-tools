import React from 'react';
import { useWeb3Context } from "web3-react";
import { ethers } from 'ethers'
import Web3Utils from 'web3-utils';
const RandomBeaconImpl = require("@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json")
const RandomBeaconService = require("@keep-network/keep-core/artifacts/KeepRandomBeaconService.json")

function getEtherscanUrl(transactionHash, networkId) {
  if (networkId == 3) {
    return `https://ropsten.etherscan.io/tx/${transactionHash}`
  }
  return `https://etherscan.io/tx/${transactionHash}`
}

export default function RandomBeacon(props) {
  const { active, account, library, networkId } = useWeb3Context();
  const [transactionHash, setTransactionHash] = React.useState()
  const signer = library.getSigner();
  const serviceContract = new ethers.Contract(RandomBeaconService.networks[networkId].address, RandomBeaconImpl.abi, signer);
  
  async function requestBeacon() {
    // TODO: use networkId from context object here
    const ret = new Promise((res, rej) => {
      serviceContract.on("*", function (ev) {
        if (ev.event === 'RelayEntryGenerated') {
          console.log(`[https://ropsten.etherscan.io/tx/${ev.transactionHash}] generated ${ev.args[0]}`);
          serviceContract.removeAllListeners();
          res({txHash: ev.transactionHash, num: ev.args[1]});
        }
      });
    });
    const entryFee = await serviceContract.entryFeeEstimate(0);
    const relayEntry = await serviceContract['requestRelayEntry()']({value: entryFee});

    console.log('waiting for entry')
    const r = await relayEntry.wait();
    console.log(`entry submitted`);

    return ret;
  }

  return (
    <React.Fragment>
      <h2>Random Beacon</h2>
      {active && account && (
        <div>
          <button onClick={requestBeacon}>
            Request Random Number
          </button>
          <p>Entry Fee: <RandomBeaconEntryFee /> ETH</p>
        </div>
      )}
      {transactionHash && <p>{transactionHash}</p>}
      <RandomBeaconEntries />
    </React.Fragment>
  )
}

function RandomBeaconEntryFee() {
  const { library, networkId, utils } = useWeb3Context();
  const signer = library.getSigner();
  const serviceContract = new ethers.Contract(RandomBeaconService.networks[networkId].address, RandomBeaconImpl.abi, signer);

  const [entryFee, setEntryFee] = React.useState()

  React.useEffect(() => {
    async function fetchData() {
      const entryFee = await serviceContract.entryFeeEstimate(0);
      setEntryFee(Web3Utils.fromWei(entryFee._hex))
    }
    fetchData()
  }, [library, networkId])

  return (
    <React.Fragment>
      {entryFee}
    </React.Fragment>
  )
}

function RandomBeaconEntries() {
  const { library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const serviceContract = new ethers.Contract(RandomBeaconService.networks[networkId].address, RandomBeaconImpl.abi, signer);

  const [entries, setEntries] = React.useState([])

  React.useEffect(() => {
    async function fetchData() {
      const filter = serviceContract.filters.RelayEntryGenerated(null, null)
      const events = await serviceContract.queryFilter(filter)
      let initialEntries = []
      for (let ev of events) {
        initialEntries.push({
          requestId: ev.args[0].toNumber(),
          value: ev.args[1].toString(),
          transactionHash: ev.transactionHash
        })
      }
      setEntries(initialEntries)

      serviceContract.on(filter, function(ev) {
        console.log(ev)
      })
      serviceContract.on('*', function(ev) {
        console.log("ALL")
        console.log(ev)
      })
    }
    fetchData()
  }, [library, networkId])

  return (
    <React.Fragment>
      <ul>
        {entries.map(entry => (
          <li key={entry.requestId}>Entry {entry.requestId} - <a href={getEtherscanUrl(entry.transactionHash, networkId)}>{entry.value}</a></li>
        ))}
      </ul>
    </React.Fragment>
  )
}
