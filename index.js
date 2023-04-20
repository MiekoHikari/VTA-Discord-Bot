// Necessary Classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Command Handler
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Event Handler
const eventsPath = path.join(__dirname, 'Events');
const eventsFolders = fs.readdirSync(eventsPath);

for (const folder of eventsFolders) {
	const eventPath = path.join(eventsPath, folder);
	const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

// Web Client
const express = require('express');
const app = express();

app.enable('trust proxy');
app.set('etag', false);
app.use(express.static(__dirname + '/WebApp'));

const publicPath = path.join(__dirname, 'WebApp/public');
const publicFiles = fs.readdirSync(publicPath).filter(file => file.endsWith('.js'));

for (const file of publicFiles) {
	const filePath = path.join(publicPath, file);
	const public = require(filePath);
	if (public && public.name) {
		app.get(public.name, public.run);
	}
}

app.get('/', async (req, res) => {
	res.sendFile('./WebApp/html/home.html', { root: __dirname });
});

app.listen(543, () => console.log('Web app launched at port 543'));