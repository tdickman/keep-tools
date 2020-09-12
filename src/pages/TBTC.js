import React from 'react';
import Container from 'react-bootstrap/Container';
import Web3Utils from 'web3-utils';
import { ethers } from 'ethers'
import { useWeb3Context } from "web3-react";
import Table from 'react-bootstrap/Table';
import { BondedECDSAKeepFactory_ADDRESS } from '../config'

import VendingMachine from "@keep-network/tbtc/artifacts/VendingMachine.json"
import BondedECDSAKeepFactory from "@keep-network/keep-ecdsa/artifacts/BondedECDSAKeepFactory.json"
import BondedECDSAKeep from "@keep-network/keep-ecdsa/artifacts/BondedECDSAKeep.json"

export default function TBTC(props) {
  const { active, account, library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const vendingMachine = new ethers.Contract(VendingMachine.networks[networkId].address, VendingMachine.abi, signer)
  const [mintedSupply, setMintedSupply] = React.useState(0)
  const [maxSupply, setMaxSupply] = React.useState(0)

  React.useEffect(() => {
    async function fetchData() {
      const mintedSupply = await vendingMachine.getMintedSupply()
      setMintedSupply(Web3Utils.fromWei(mintedSupply._hex))
      const maxSupply = await vendingMachine.getMaxSupply()
      setMaxSupply(Web3Utils.fromWei(maxSupply._hex))
    }
    fetchData()
  }, [library, networkId, account])

  return (
    <Container>
      <h2>TBTC</h2>
      <p>Minted supply: {mintedSupply} tbtc</p>
      <p>Max supply: {maxSupply} tbtc</p>
      <KeepList />
    </Container>
  )
}

function KeepList() {
  const { active, account, library, networkId } = useWeb3Context();
  const signer = library.getSigner();
  const factory = new ethers.Contract(BondedECDSAKeepFactory_ADDRESS[networkId], BondedECDSAKeepFactory.abi, signer)

  const [keeps, setKeeps] = React.useState([])

  React.useEffect(() => {
    async function fetchData() {
      let keepCount = await factory.getKeepCount()
      for (let i = keepCount-1; i >= 0; i--) {
        const keepAddress = await factory.getKeepAtIndex(i)
        const keep = new ethers.Contract(keepAddress, BondedECDSAKeep.abi, signer)
        const [members, keepPublicKey, isActive, bondWei] = await Promise.all([keep.getMembers(), keep.publicKey(), keep.isActive(), keep.checkBondAmount()])
        if (!isActive) {
          continue
        }
        const bond = Web3Utils.fromWei(bondWei._hex)

        setKeeps(o => [...o, {
          index: i,
          isActive: isActive,
          bond: bond,
          publicKey: keepPublicKey
        }])
      }
    }
    fetchData()
  }, [library, networkId, account])

  // A table of keeps, and their status
  return (
    <Table striped bordered hover style={{tableLayout: "fixed"}}>
      <thead>
        <tr>
          <th>Index</th>
          <th>Is Active</th>
          <th>Bond</th>
          <th>Public Key</th>
        </tr>
      </thead>
      <tbody>
        {keeps.map(k => (
          <tr key={k.index}>
            <td>{k.index}</td>
            <td>{k.isActive.toString()}</td>
            <td>{k.bond} ETH</td>
            <td style={{textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap'}}>{k.publicKey}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
