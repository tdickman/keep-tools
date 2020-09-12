import React from 'react';
import { useWeb3Context } from "web3-react";
import { ethers } from 'ethers'
import Web3Utils from 'web3-utils';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';
import { getEtherscanUrl } from '../utils';

const RandomBeaconImpl = require("@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json")
const RandomBeaconService = require("@keep-network/keep-core/artifacts/KeepRandomBeaconService.json")
const RandomBeaconOperator = require("@keep-network/keep-core/artifacts/KeepRandomBeaconOperator.json")

export default function RandomBeaconEntries(props) {
  const { active, account, library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const serviceContract = new ethers.Contract(RandomBeaconService.networks[networkId].address, RandomBeaconImpl.abi, signer);
  
  async function requestBeacon() {
    const entryFee = await serviceContract.entryFeeEstimate(0);
    const relayEntry = await serviceContract['requestRelayEntry()']({value: entryFee});
  }

  return (
    <Container>
      <h2>Random Beacon Entries</h2>
      {active && account && (
        <div>
          <Button variant="primary" onClick={requestBeacon}>
            Request Random Number
          </Button>
          <p>Entry Fee: <RandomBeaconEntryFee /> ETH</p>
        </div>
      )}
      <Entries />
    </Container>
  )
}

function RandomBeaconEntryFee() {
  const { library, networkId } = useWeb3Context();
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

function Entries() {
  const { library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const serviceContract = new ethers.Contract(RandomBeaconService.networks[networkId].address, RandomBeaconImpl.abi, signer);
  const operatorContract = new ethers.Contract(RandomBeaconOperator.networks[networkId].address, RandomBeaconOperator.abi, signer);

  const [requestedEntries, setRequestedEntries] = React.useState({})
  const [generatedEntries, setGeneratedEntries] = React.useState({})
  const [requestPubkeyByBlock, setRequestPubkeyByBlock] = React.useState({})

  React.useEffect(() => {
    async function fetchData() {

      // RelayEntryRequested
      const requestedFilter = serviceContract.filters.RelayEntryRequested(null)
      const requestedEvents = await serviceContract.queryFilter(requestedFilter)
      let initialRequestedEntries = {}
      for (let ev of requestedEvents) {
        requestedEntries[ev.args[0].toNumber()] = {
          blockNumber: ev.blockNumber,
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

      // RelayEntryRequested (operator contract) - this exposes the pub key
      // used for each generation, and then we can use the block it was
      // generated in to map it to the group. Kinda convoluted, but it works.
      // Only one entry can be generated at a time, so we should have no block
      // colisions.
      const requestedOperatorFilter = operatorContract.filters.RelayEntryRequested(null, null)
      const requestedOperatorEvents = await operatorContract.queryFilter(requestedOperatorFilter)
      let initialRequestPubkeyByBlock = {}
      for (let ev of requestedOperatorEvents) {
        initialRequestPubkeyByBlock[ev.blockNumber] = ev.args.groupPublicKey
      }
      setRequestPubkeyByBlock(initialRequestPubkeyByBlock)

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
      <Table striped bordered hover style={{tableLayout: "fixed"}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Request TX</th>
            <th>Generation TX</th>
            <th>Value</th>
            <th>Group Pub Key</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(requestedEntries).sort(function(a, b){return a-b}).reverse().map(requestId => (
            <tr key={requestId}>
              <td>{requestId}</td>
              <td>{requestedEntries[requestId] ? <a target='_blank' href={getEtherscanUrl(requestedEntries[requestId].txHash, networkId)}>Requested</a> : ''}</td>
              <td>{generatedEntries[requestId] ? <a target='_blank' href={getEtherscanUrl(generatedEntries[requestId].txHash, networkId)}>Generated</a> : ''}</td>
              <td style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{generatedEntries[requestId] ? <span>{generatedEntries[requestId].value}</span> : ''}</td>
              <td style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}><Link to={`/random-beacon/groups/${requestPubkeyByBlock[requestedEntries[requestId].blockNumber]}`}>{requestPubkeyByBlock[requestedEntries[requestId].blockNumber]}</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </React.Fragment>
  )
}
