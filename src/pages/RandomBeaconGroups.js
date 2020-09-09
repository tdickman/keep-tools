import React from 'react';
import { useWeb3Context } from "web3-react";
import { ethers } from 'ethers'
import Container from 'react-bootstrap/Container';

import KeepRandomBeaconOperator from "@keep-network/keep-core/artifacts/KeepRandomBeaconOperator.json"

export default function RandomBeaconGroups(props) {
  const { active, account, library, networkId } = useWeb3Context();

  return (
    <Container>
      <h2>Random Beacon Groups</h2>
      {active && account && (
        <div>
          <p>There are <GroupCount /> groups, <ActiveGroups /> are active.</p>
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

function ListGroups() {
  const { library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const keepRandomBeaconOperator = new ethers.Contract(KeepRandomBeaconOperator.networks[networkId].address, KeepRandomBeaconOperator.abi, signer)
}
