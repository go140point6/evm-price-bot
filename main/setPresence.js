require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const ethers = require('ethers')
const { getBasePrice } = require('../main/getBasePrice')

const up = "\u2B08"
const down = "\u2B0A"
const mid = "\u22EF"

async function setPresence(red, green, member) {
    console.log("From setPresence:", red.name)
    console.log("From setPresence:", green.name)

    //clearRoles(red, green, member)
    setGreen(red, green, member)
    
    const baseUSD = await getBasePrice()
    getTokenPrice(baseUSD)
}

async function clearRoles(red, green, member) {
    await member.roles.remove(red)
    await member.roles.remove(green)
}

async function setRed(red, green, member) {
    console.log('Setting red role now...')
    await clearRoles(red, green, member)
    await member.roles.add(red)
    let redRole = await member.roles.cache.some(role => role.name === ('tickers-red'))
    console.log ('Attempted adding of redRole, if successful, this should be true:', redRole)
    if (!redRole) {
       console.log ('ERROR, still showing false for redRole... trying again...')
       await (member.roles.add(red))
       let redRole = await member.roles.cache.some(role => role.name === ('tickers-red'))
       console.log ('Attempted 2nd adding of redRole, if successful, this should be true:', redRole)
    }
}

async function setGreen(red, green, member) {
    console.log('Setting green role now...')
    await clearRoles(red, green, member)
    await member.roles.add(green)
    let greenRole = await member.roles.cache.some(role => role.name === ('tickers-green'))
    console.log ('Attempted adding of greenRole, if successful, this should be true:', greenRole)
    if (!greenRole) {
       console.log ('ERROR, still showing false for greenRole... trying again...')
       await (member.roles.add(green))
       let greenRole = await member.roles.cache.some(role => role.name === ('tickers-green'))
       console.log ('Attempted 2nd adding of greenRole, if successful, this should be true:', greenRole)
    }
}

async function getTokenPrice(baseUSD) {
    console.log(`Current price (getTokenPriceFunc):`, baseUSD)
}

module.exports = {
    setPresence
}