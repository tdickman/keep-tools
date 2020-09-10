export function getEtherscanUrl(transactionHash, networkId) {
  if (networkId == 3) {
    return `https://ropsten.etherscan.io/tx/${transactionHash}`
  }
  return `https://etherscan.io/tx/${transactionHash}`
}
