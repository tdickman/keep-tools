import React from 'react';
import { useWeb3Context } from "web3-react";
import { ethers } from 'ethers'
import Web3Utils from 'web3-utils';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

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
    const entryFee = await serviceContract.entryFeeEstimate(0);
    const relayEntry = await serviceContract['requestRelayEntry()']({value: entryFee});
  }

  return (
    <Container>
      <h2>Random Beacon</h2>
      {active && account && (
        <div>
          <Button variant="primary" onClick={requestBeacon}>
            Request Random Number
          </Button>
          <p>Entry Fee: <RandomBeaconEntryFee /> ETH</p>
        </div>
      )}
      {transactionHash && <p>{transactionHash}</p>}
      <RandomBeaconEntries />
    </Container>
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

  const [requestedEntries, setRequestedEntries] = React.useState({})
  const [generatedEntries, setGeneratedEntries] = React.useState({})

  React.useEffect(() => {
    async function fetchData() {

      // RelayEntryRequested
      const requestedFilter = serviceContract.filters.RelayEntryRequested(null)
      const requestedEvents = await serviceContract.queryFilter(requestedFilter)
      let initialRequestedEntries = {}
      for (let ev of requestedEvents) {
        requestedEntries[ev.args[0].toNumber()] = {
          txHash: ev.transactionHash
        }
      }
      setRequestedEntries(requestedEntries)

      // RelayEntryGenerated
      const generatedFilter = serviceContract.filters.RelayEntryGenerated(null, null)
      const generatedEvents = await serviceContract.queryFilter(generatedFilter)
      let initialGeneratedEntries = {}
      for (let ev of generatedEvents) {
        initialGeneratedEntries[ev.args[0].toNumber()] = {
          value: ev.args[1].toString(),
          txHash: ev.transactionHash
        }
      }
      setGeneratedEntries(initialGeneratedEntries)

      serviceContract.on('*', function(ev) {
        console.log(ev)
        if (ev.event === 'RelayEntryRequested') {
          setRequestedEntries(prevState => ({
            ...prevState,
            [ev.args[0].toNumber()]: {txHash: ev.transactionHash}
          }))
        }

        if (ev.event === 'RelayEntryGenerated') {
          setGeneratedEntries(prevState => ({
            ...prevState,
            [ev.args[0].toNumber()]: {
              value: ev.args[1].toString(),
              txHash: ev.transactionHash
            }
          }))
        }
      })
    }
    fetchData()
  }, [library, networkId])

  return (
    <React.Fragment>
      <ul>
        {Object.keys(requestedEntries).sort(function(a, b){return a-b}).reverse().map(requestId => (
          //<li key={entry.requestId}>Entry {entry.requestId} - <a target='_blank' href={getEtherscanUrl(entry.transactionHash, networkId)}>{entry.value}</a></li>
          <li key={requestId}>{requestId}{requestedEntries[requestId] ? <span> - <a target='_blank' href={getEtherscanUrl(requestedEntries[requestId].txHash, networkId)}>Requested</a></span> : ''}{generatedEntries[requestId] ? <span> - <a target='_blank' href={getEtherscanUrl(generatedEntries[requestId].txHash, networkId)}>Generated</a> - {generatedEntries[requestId].value}</span> : ''}</li>
        ))}
      </ul>
    </React.Fragment>
  )
}
