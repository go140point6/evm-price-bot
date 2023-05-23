require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const ethers = require('ethers')
const fs = require('fs')
const { parse } = require('csv-parse')
const { getBasePrice } = require('../main/getBasePrice')

dexArray = []
avgBaseTokenArray = []
avgUSDTokenArray = []

const provider = new ethers.providers.JsonRpcProvider(`${process.env.RPC_PROVIDER}`)

const bWToken = process.env.WBASE_TOKEN
const bWTAddress = process.env.WBASE_ADDRESS
const bWTDecimals = process.env.WBASE_DECIMALS
const bWTFixed = process.env.WBASE_FIXED
const pToken = process.env.PAIR_TOKEN
const pTAddress = process.env.PT_ADDRESS
const pTDecimals = process.env.PT_DECIMALS
const pTFixed = process.env.PT_FIXED
const token = process.env.PAIR_TOKEN.toUpperCase()

const createDexArray = new Promise((resolve, reject) => {
  fs.createReadStream(`./data/${process.env.BASE_TOKEN}DexInfo.csv`)
  .pipe(parse({ delimiter: ",", columns: true }))
  .on('data', function (row) {
      dexArray.push(row) 
  })
  .on('end', function() {
      resolve(dexArray)
  })
  .on('error', function(err) {
      reject(err)
  })
})

async function getCurrentPrice(nick,router,abi) {
  let parsedJsonAbi = JSON.parse(fs.readFileSync(`./abi/${abi}`))
  const routerInstance = new ethers.Contract(
    router,
    parsedJsonAbi,
    provider
  )

  try {
    const baseUSD = await getBasePrice()
    const result = await routerInstance.getAmountsOut(
      ethers.utils.parseEther("1"),
      [bWTAddress, pTAddress]
    )



    let bWTUSDPrice = (baseUSD / (Number(result[0]._hex) / 10 ** bWTDecimals)).toFixed(bWTFixed)
    console.log(bWTUSDPrice)
    let pTokenPrice = (Number(result[1]._hex) / 10 ** pTDecimals).toFixed(pTFixed)
    console.log(pTokenPrice)
    let pTUSDPrice = (baseUSD / pTokenPrice).toFixed(pTFixed)
    console.log(pTUSDPrice)
    console.log(bWToken.toUpperCase() + " USD price is " + bWTUSDPrice + " from " + nick)
    console.log(pToken.toUpperCase() + " USD price is " + pTUSDPrice + " from " + nick)
    avgBaseTokenArray.push(Number(pTokenPrice))
    avgUSDTokenArray.push(Number(pTUSDPrice))
  } catch (error) {
    if (error.message.includes('INSUFFICIENT_LIQUIDITY')) {
      console.log(`${nick} has Insufficient Liquidity`)
    } else {
      console.log('Error:', error);  
    }
  }
}

async function getCombinedTokenUSDPrice(avgUSDTokenArray) {
  let sum = 0
  for (let i = 0; i < avgUSDTokenArray.length; i++) {
    sum += avgUSDTokenArray[i]
  }
  const avgUSDTokenPrice = Number(sum / avgUSDTokenArray.length).toFixed(pTFixed)
  console.log(`${token} token is ${process.env.CURRENCY_SYMBOL}${avgUSDTokenPrice}`) 
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
  try {
    await createDexArray;
    for (const row of dexArray) {
      const nick = row.nick
      const router = row.router
      const abi = row.abi
      await getCurrentPrice(nick, router, abi)
    }
    //console.log(avgBaseTokenArray)
    //console.log(avgUSDTokenArray)
    const avgUSDTokenPrice = await getCombinedTokenUSDPrice(avgUSDTokenArray)
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