require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const ethers = require('ethers')
const fs = require('fs')
const { getBasePrice } = require('./getBasePrice')

avgBaseTokenArray = []
avgUSDTokenArray = []

const provider = new ethers.providers.JsonRpcProvider(`${process.env.RPC_PROVIDER}`)

const bWToken = process.env.WBASE_TOKEN
const bWTAddress = process.env.WBASE_ADDRESS
const bWTDecimals = process.env.WBASE_DECIMALS
const bWTFixed = process.env.WBASE_FIXED
const pToken = process.env.PAIR_TOKEN.toUpperCase()

var pTFixed

function getTokenInfo(array) {
  const allTokenInfo = {};
  for (const item of array) {
    allTokenInfo[item.nick] = item;
  }
  return allTokenInfo;
}    

async function getCurrentPrice(name,router,abi,amountToken) {
  try {
    let parsedJsonAbi = JSON.parse(fs.readFileSync(`./abi/${abi}`))
    const routerInstance = new ethers.Contract(
      router,
      parsedJsonAbi,
      provider
    )
    
    const baseUSD = await getBasePrice()

    const allTokenInfo = getTokenInfo(tokenArray)

    const item = allTokenInfo[pToken.toLowerCase()]
    let pTAddress
    let pTDecimals
    if (item) {
      const { address, ticker, fullname, decimals, pt_fixed } = item
      pTAddress = address
      pTTicker = ticker
      pTFullName = fullname
      pTDecimals = decimals
      pTFixed = pt_fixed
    } else {
      console.log('Nothing found for nick:', nick)
      process.exit(1)
    }
    
    const result = await routerInstance.getAmountsOut(
      ethers.utils.parseEther(amountToken),
      [bWTAddress, pTAddress]
    )
    
    let bWTUSDPrice = (baseUSD / (Number(result[0]._hex) / 10 ** bWTDecimals)).toFixed(bWTFixed)
    //console.log(bWTUSDPrice)
    let pTokenPrice = (Number(result[1]._hex) / 10 ** pTDecimals).toFixed(pTFixed)
    if (pTokenPrice != 0) {
      let pTUSDPrice = (baseUSD / pTokenPrice).toFixed(pTFixed)
      //console.log(bWToken.toUpperCase() + " USD price is " + bWTUSDPrice + " from " + name)
      console.log(pToken.toUpperCase() + " USD price is " + pTUSDPrice + " from " + name)
      avgUSDTokenArray.push(Number(pTUSDPrice))        
    } else {
      console.log(`${name} doesn't appear to have pricing information for ${pToken}`)
    }
    avgBaseTokenArray.push(Number(pTokenPrice))
  } catch (error) {
    //if (error.message.includes('INSUFFICIENT_LIQUIDITY')) {
      //console.log(`${name} has Insufficient Liquidity`)
    //} else {
      console.log(`${name} has the following error with ${pToken.toUpperCase()}: ${error.reason}`);  
    }
  }
//}

async function getCombinedTokenUSDPrice(avgUSDTokenArray) {
  let sum = 0
  for (let i = 0; i < avgUSDTokenArray.length; i++) {
    sum += avgUSDTokenArray[i]
  }
  const avgUSDTokenPrice = Number(sum / avgUSDTokenArray.length).toFixed(pTFixed)
  console.log(`${pToken} token average is ${process.env.CURRENCY_SYMBOL}${avgUSDTokenPrice}`) 
  return avgUSDTokenPrice
}

async function getCombinedTokenBasePrice(avgBaseTokenArray) {
  let sum = 0
  for (let i = 0; i < avgBaseTokenArray.length; i++) {
    sum += avgBaseTokenArray[i]
  }
  const avgBaseTokenPrice = Number(sum / avgBaseTokenArray.length).toFixed(2)
  return avgBaseTokenPrice
}

async function processDexArray() {
  //console.log(dexArray)
  //console.log(tokenArray)
  try {
    for (const row of dexArray) {
      const name = row.name
      const router = row.router
      const abi = row.abi
      let amountToken = "1"
      await getCurrentPrice(name, router, abi, amountToken)
    }
    //console.log(avgBaseTokenArray)
    //console.log(avgUSDTokenArray)
    const avgUSDTokenPrice = await getCombinedTokenUSDPrice(avgUSDTokenArray, pTFixed)
    const avgBaseTokenPrice = await getCombinedTokenBasePrice(avgBaseTokenArray)
    //console.log('In processDexArray:', avgUSDTokenPrice)
    //console.log('In processDexArray:', avgBaseTokenPrice)
    avgUSDTokenArray = []
    avgBaseTokenArray = []
    return { avgUSDTokenPrice: avgUSDTokenPrice, avgBaseTokenPrice: avgBaseTokenPrice }
  } catch (err) {
    console.log(err)
  }
}

//processDexArray()

module.exports = { 
  processDexArray
}