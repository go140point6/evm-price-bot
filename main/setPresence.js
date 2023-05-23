require('dotenv').config({ path: '../.env' }) // Load .env file from root!
require('log-timestamp')
const { ActivityType } = require('discord.js')
const { getBasePrice } = require('../main/getBasePrice')
const { processDexArray } = require('../main/getTokenPrice')

const up = "\u2B08"
const down = "\u2B0A"
const mid = "\u22EF"
const base = process.env.BASE_TOKEN.toUpperCase()
const token = process.env.PAIR_TOKEN.toUpperCase()

var arrow = mid
var lastPrice

async function setPresence(client, red, green, member) {
    //console.log("From setPresence:", red.name)
    //console.log("From setPresence:", green.name)

    const baseUSD = await getBasePrice()
    //console.log(`setPresenceFunc:`, baseUSD)
    console.log(`${base} token is ${process.env.CURRENCY_SYMBOL}${baseUSD}`) 
    const { avgUSDTokenPrice, avgBaseTokenPrice } = await processDexArray()
    //console.log(avgUSDTokenPrice)
    //console.log(avgBaseTokenPrice)
    //console.log(`setPresenceFunc:`, avgUSDTokenPrice)
    //getTokenPrice(baseUSD, avgUSDTokenPrice)

    if (typeof lastPrice === 'undefined') {
        //console.log('lastPrice is undefined - ok first run')
        clearRoles(red, green, member)
        arrow = mid
        lastPrice = avgUSDTokenPrice
        //console.log(lastPrice)
    } else {
        //console.log('avgUSDTokenPrice:', avgUSDTokenPrice)
        //console.log('lastPrice:', lastPrice)
        if (avgUSDTokenPrice > lastPrice) {
            console.log(`${token} price is up`)
            arrow = up
            setGreen(red, green, member)
            lastprice = avgUSDTokenPrice
        } else if (avgUSDTokenPrice < lastPrice) {
            console.log(`${token} price is down`)
            arrow = down
            setRed(red, green, member)
            lastPrice = avgUSDTokenPrice
        } else {
            console.log(`${token} price is the same`)
        }
    }

    //console.log(`lastPrice:`, lastPrice)

    let symbol = `${process.env.PAIR_TOKEN.toUpperCase()}`

    client.user.setPresence({
        activities: [{
        name: `${process.env.BASE_TOKEN.toUpperCase()}=${avgBaseTokenPrice} ${symbol}`,
        type: ActivityType.Watching
        }]
      })

    member.setNickname(`${symbol} ${arrow} ${process.env.CURRENCY_SYMBOL}${avgUSDTokenPrice}`)
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
    //console.log('Setting green role now...')
    await clearRoles(red, green, member)
    await member.roles.add(green)
    let greenRole = await member.roles.cache.some(role => role.name === ('tickers-green'))
    //console.log ('Attempted adding of greenRole, if successful, this should be true:', greenRole)
    if (!greenRole) {
       //console.log ('ERROR, still showing false for greenRole... trying again...')
       await (member.roles.add(green))
       let greenRole = await member.roles.cache.some(role => role.name === ('tickers-green'))
       //console.log ('Attempted 2nd adding of greenRole, if successful, this should be true:', greenRole)
    }
}

async function getTokenPrice(baseUSD, avgUSDTokenPrice, avgBaseTokenPrice) {
    console.log(`Current price of ${process.env.BASE_TOKEN} (getTokenPriceFunc):`, baseUSD) // This is current BASE_TOKEN (SGB) USD price
    console.log(`Current TOKEN price of ${process.env.PAIR_TOKEN} (getTokenPriceFunc):`, avgBaseTokenPrice) // This is current average PAIR_TOKEN priced in BASE_TOKEN
    console.log(`Current USD price of ${process.env.PAIR_TOKEN} (getTokenPriceFunc):`, avgUSDTokenPrice) // This is current average PAIR_TOKEN priced in USD
}

module.exports = {
    setPresence
}