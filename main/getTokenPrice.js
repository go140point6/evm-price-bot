require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const ethers = require('ethers')
const fs = require('fs')
const { getBasePrice } = require('../main/getBasePrice')

const oracleSwapRouterAddress = process.env.OS_ROUTER
const pangolinRouterAddress = process.env.PG_ROUTER
const blazeSwapRouterAddress = process.env.BZ_ROUTER

const abiOracleSwapRouter = JSON.parse(fs.readFileSync(`./abi/oracleSwapRouter.abi`))
const abiPangolinRouter = JSON.parse(fs.readFileSync(`./abi/pangolinRouter.abi`))
const abiBlazeSwapRouter = JSON.parse(fs.readFileSync(`./abi/blazeSwapRouter.abi`))

const provider = new ethers.providers.JsonRpcProvider(`${process.env.RPC_PROVIDER}`)

const bWToken = process.env.WBASE_TOKEN
const bWTAddress = process.env.WBASE_ADDRESS
const bWTDecimals = process.env.WBASE_DECIMALS
const bWTFixed = process.env.WBASE_FIXED
const pToken = process.env.PAIR_TOKEN
const pTAddress = process.env.PT_ADDRESS
const pTDecimals = process.env.PT_DECIMALS
const pTFixed = process.env.PT_FIXED

async function osCurrentPrice() {
  const osRouterInstance = new ethers.Contract(
    oracleSwapRouterAddress,
    abiOracleSwapRouter,
    provider
  )

  try {
    const baseUSD = await getBasePrice()
    const result = await osRouterInstance.getAmountsOut(
      ethers.utils.parseEther("1"),
      [bWTAddress, pTAddress]
    )

    let bWTUSDPrice = (baseUSD / (Number(result[0]._hex) / 10 ** bWTDecimals)).toFixed(bWTFixed)
    let pTUSDPrice = (baseUSD / (Number(result[1]._hex) / 10 ** pTDecimals)).toFixed(pTFixed)
    console.log(bWToken.toUpperCase() + " USD price is " + bWTUSDPrice)
    console.log(pToken.toUpperCase() + " USD price is " + pTUSDPrice)
  } catch (error) {
    console.log('Error:', error);
  }
}

module.exports = { 
  osCurrentPrice
}