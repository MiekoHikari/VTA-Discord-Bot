const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Levels = require('discord-xp');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await mongoose.connect(process.env.DBCONNECTIONSTRING, {
			keepAlive: true,
		});
		await Levels.setURL(process.env.DBCONNECTIONSTRING);

		client.user.setActivity('the cat (Do not the cat)', { type: ActivityType.Watching });
		client.user.setStatus('dnd');

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
