import React from 'react';
import { useWeb3Context } from "web3-react";
import { ethers } from 'ethers'
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { getEtherscanUrl } from '../utils';

import KeepRandomBeaconOperator from "@keep-network/keep-core/artifacts/KeepRandomBeaconOperator.json"

export default function RandomBeaconGroups(props) {
  const { active, account, library, networkId } = useWeb3Context();

  return (
    <Container>
      <h2>Random Beacon Groups</h2>
      {active && account && (
        <div>
          <p>There are <GroupCount /> groups, <ActiveGroups /> are active.</p>
          <p>Your address: {account}</p>
          <ListGroups />
        </div>
      )}
    </Container>
  )
}

function GroupCount() {
  const { library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const keepRandomBeaconOperator = new ethers.Contract(KeepRandomBeaconOperator.networks[networkId].address, KeepRandomBeaconOperator.abi, signer)
  const [groupCount, setGroupCount] = React.useState()

  React.useEffect(() => {
    async function fetchData() {
      const groupCount = await keepRandomBeaconOperator.getNumberOfCreatedGroups()
      setGroupCount(groupCount.toNumber())
    }
    fetchData()
  }, [library, networkId])

  return (
    <React.Fragment>
      {groupCount}
    </React.Fragment>
  )
}

function ActiveGroups() {
  const { library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const keepRandomBeaconOperator = new ethers.Contract(KeepRandomBeaconOperator.networks[networkId].address, KeepRandomBeaconOperator.abi, signer)
  const [activeGroupCount, setActiveGroupCount] = React.useState()

  React.useEffect(() => {
    async function fetchData() {
      const groupCount = await keepRandomBeaconOperator.getNumberOfCreatedGroups()
      const firstActiveGroup = await keepRandomBeaconOperator.getFirstActiveGroupIndex()
      setActiveGroupCount(groupCount.toNumber() - firstActiveGroup.toNumber())
    }
    fetchData()
  }, [library, networkId])

  return (
    <React.Fragment>
      {activeGroupCount}
    </React.Fragment>
  )
}

function ListGroups(props) {
  const lookbackBlocks = props.lookbackBlocks || 50000
  const { library, networkId, account } = useWeb3Context();
  const signer = library.getSigner();
  const keepRandomBeaconOperator = new ethers.Contract(KeepRandomBeaconOperator.networks[networkId].address, KeepRandomBeaconOperator.abi, signer)
  const [groups, setGroups] = React.useState([])

  React.useEffect(() => {
    async function fetchData() {
      const firstActiveGroup = await keepRandomBeaconOperator.getFirstActiveGroupIndex()
      const events = await keepRandomBeaconOperator.queryFilter(keepRandomBeaconOperator.filters.DkgResultSubmittedEvent(null, null), -lookbackBlocks)
      let groupsToSet = []
      for (let ev of events.reverse()) {
        const groupMembers = await keepRandomBeaconOperator.getGroupMembers(ev.args.groupPubKey)
        console.log(ev)
        setGroups(o => [...o, {
          pubKey: ev.args.groupPubKey,
          txHash: ev.transactionHash,
          isAMember: groupMembers.indexOf(account) > -1,
          isActive: ev.args[0].toNumber() >= firstActiveGroup,
          uniqueGroupMembers: new Set(groupMembers).size,
          created: ev.blockNumber,
          groupSize: groupMembers.length
        }])
      }
    }
    fetchData()
  }, [library, networkId, lookbackBlocks, account])

  return (
    <React.Fragment>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>You are a Member</th>
            <th>Is Active</th>
            <th>Unique Group Members</th>
            <th>Group Size</th>
            <th>Created</th>
            <th>TX</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.txHash}>
              <td>{group.isAMember.toString()}</td>
              <td>{group.isActive.toString()}</td>
              <td>{group.uniqueGroupMembers}</td>
              <td>{group.groupSize}</td>
              <td>{group.created}</td>
              <td><a href={getEtherscanUrl(group.txHash, networkId)}>TX</a></td>
              <td><Link to={`/random-beacon/groups/${group.pubKey}`}>Details</Link></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </React.Fragment>
  )
}
