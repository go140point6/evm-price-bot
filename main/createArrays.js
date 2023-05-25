require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const fs = require('fs')
const { parse } = require('csv-parse')

tokenArray = []
dexArray = []

const createTokenArray = new Promise((resolve, reject) => {
    fs.createReadStream(`./data/${process.env.BASE_TOKEN}TokenInfo.csv`)
    .pipe(parse({ delimiter: ",", columns: true }))
    .on('data', function (row) {
        tokenArray.push(row) 
    })
    .on('end', function() {
        resolve(tokenArray)
        //console.log(tokenArray)
    })
    .on('error', function(err) {
        reject(err)
    })
  })

  const createDexArray = new Promise((resolve, reject) => {
    fs.createReadStream(`./data/${process.env.BASE_TOKEN}DexInfo.csv`)
    .pipe(parse({ delimiter: ",", columns: true }))
    .on('data', function (row) {
        dexArray.push(row) 
    })
    .on('end', function() {
        resolve(dexArray)
        //console.log(dexArray)
    })
    .on('error', function(err) {
        reject(err)
    })
  })

async function createArrays() {
    await createTokenArray
    await createDexArray
    return {
        tokenArray: tokenArray,
        dexArray: dexArray
    }
}

module.exports = { 
    createArrays
  }