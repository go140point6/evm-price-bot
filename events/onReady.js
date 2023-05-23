require('dotenv').config()
// Node's native file system module. fs is used to read the commands directory and identify our command files.
const fs = require('node:fs')
// Node's native path utility module. path helps construct paths to access files and directories. One of the advantages of the path module is that it automatically detects the operating system and uses the appropriate joiners.
const path = require('node:path')
const { REST, Routes, Collection } = require('discord.js')
const { setPresence } = require('../main/setPresence')

async function onReady(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`)

    let guild = client.guilds.cache.get(`${process.env.GUILD_ID}`)
    let member = guild.members.me
    let red = guild.roles.cache.find(role => role.name === 'tickers-red')
    let green = guild.roles.cache.find(role => role.name === 'tickers-green')

    client.commands = new Collection();

    const commands = [];

    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
            commands.push(command.data.toJSON())
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    // and deploy your commands!
    (async () => {
	    try {
		    // The put method is used to fully refresh all commands in the guild with the current set.
		    const data = await rest.put(
			    Routes.applicationGuildCommands(
                    process.env.CLIENT_ID, 
                    process.env.GUILD_ID
                    ),
			    { body: commands },
		    );

		    console.log(`Successfully loaded ${data.length} application (/) commands.`)
	    } catch (error) {
		    // Catch and log any errors.
		    console.error(error)
	    }
    })();

    setPresence(client, red, green, member).catch((error) => {
        console.error('Error:', error)
    })
    setInterval(() => {
        setPresence(client, red, green, member).catch((error) => {
            console.error('Error:', error)
        })
    }, Math.max(1, 1 || 1) * 60 * 1000) // set the 2nd digit in Math.max to however many minutes you want the function to run (default here is 5 minutes)
}

module.exports = { 
    onReady
}