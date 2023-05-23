require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const ethers = require('ethers')
const fs = require('fs')

// All Flare's smart contracts (Flare, Songbird, Conston, Conston2) retrieved from here
// Use it to get all other contracts (by name for example) 
const contractRegistryAddress = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019"

const abiContractRegistry = JSON.parse(fs.readFileSync(`./abi/${process.env.BASE_TOKEN}ContractRegistry.abi`))
const abiFtsoRegistry = JSON.parse(fs.readFileSync(`./abi/${process.env.BASE_TOKEN}FtsoRegistry.abi`))

const provider = new ethers.providers.JsonRpcProvider(
    `${process.env.RPC_PROVIDER}`
    )

async function getCurrentPrice(ftsoRegistryAddress) {
  const registryFtsoInstance = new ethers.Contract(
    ftsoRegistryAddress,
    abiFtsoRegistry,
    provider
  );

  try {
    const results = await registryFtsoInstance["getCurrentPriceWithDecimals(string)"](`${process.env.BASE_TOKEN}`.toUpperCase());
    let decimals = Number(results._assetPriceUsdDecimals);
    let baseUSD = Number(results._price) / 10 ** decimals;
    return baseUSD
  } catch (error) {
    console.log('Error:', error);
  }
}

async function getBasePrice() {
  const registryContractInstance = new ethers.Contract(
    contractRegistryAddress,
    abiContractRegistry,
    provider
  )

  try {
    const result = await registryContractInstance.functions.getContractAddressByName("FtsoRegistry");
    const ftsoRegistryAddress = result[0];
    let baseUSD = await getCurrentPrice(ftsoRegistryAddress);
    //console.log(`${base} token is ${process.env.CURRENCY_SYMBOL}${baseUSD}`) 
    return baseUSD
  } catch (error) {
    console.log('Error'. error)
  }
}

module.exports = { 
  getBasePrice
}