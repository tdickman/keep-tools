import React from 'react';
import Container from 'react-bootstrap/Container';
import { useWeb3Context } from "web3-react";
import { ethers } from 'ethers'
import { getEtherscanUrl } from '../utils';

import KeepRandomBeaconOperator from "@keep-network/keep-core/artifacts/KeepRandomBeaconOperator.json"

export default function RandomBeaconGroupDetails(props) {
  const { active, account, library, networkId } = useWeb3Context();
  // No clean way to retrieve a single event, so passing around block number for now
  const blockNumber = parseInt(props.match.params.blockNumber)
  const signer = library.getSigner();
  const keepRandomBeaconOperator = new ethers.Contract(KeepRandomBeaconOperator.networks[networkId].address, KeepRandomBeaconOperator.abi, signer)
  const [group, setGroup] = React.useState({})

  React.useEffect(() => {
    async function fetchData() {
      const firstActiveGroup = await keepRandomBeaconOperator.getFirstActiveGroupIndex()
      const events = await keepRandomBeaconOperator.queryFilter(keepRandomBeaconOperator.filters.DkgResultSubmittedEvent(null, null), blockNumber, blockNumber)
      const ev = events[0]
      const groupMembers = await keepRandomBeaconOperator.getGroupMembers(ev.args.groupPubKey)
      const block = await ev.getBlock()
      // const generatedEntres = await keepRandomBeaconOperator.getGroupMembers(ev.args.groupPubKey)
      console.log(ev)
      let date = new Date(0)
      date.setUTCSeconds(block.timestamp)
      setGroup({
        txHash: ev.transactionHash,
        isActive: ev.args[0].toNumber() >= firstActiveGroup,
        uniqueGroupMembers: new Set(groupMembers).size,
        createdBlock: ev.blockNumber,
        createdDate: date.toString(),
        groupMembers: groupMembers,
        groupPubKey: ev.args.groupPubKey
      })
    }
    fetchData()
  }, [library, networkId, account])

  return (
    <Container>
      <h2>Random Beacon Group Details</h2>
      {active && account && (
        <div>
          <p>Transaction: <a href={getEtherscanUrl(group.txHash, networkId)}>{group.txHash}</a></p>
          <p style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>Public key: {group.groupPubKey}</p>
          <p>Group Size: {group.groupMembers && group.groupMembers.length}</p>
          <p>Unique group members: {group.uniqueGroupMembers}</p>
          <p>Created: {group.createdDate}</p>
          {group.groupMembers && (
            <>
              <p>Group Members:</p>
              <ul>
              {group.groupMembers.map((m,i) => (
                <li key={i}>{m}</li>
              ))}
              </ul>
            </>
          )}
        </div>
      )}
    </Container>
  )
}
