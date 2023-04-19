const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const port = 10000;
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');

app.get('/', (req, res) => {
	// 200 status code means OK
	res.status(200).send('OK');
});

app.use('/avatars', express.static(path.join(__dirname, 'Storage/Avatars')));

app.listen(port, () => {
	console.log(`VTA BOT listening on port ${port}`);
});
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({ partials: [Partials.Channel, Partials.Message, Partials.User], intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
] });

client.commands = new Collection();

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const commandsPath = path.join(__dirname, 'commands');
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

client.login(process.env.TOKEN);
