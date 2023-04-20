const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Connected to Discord as: ${client.user.tag}`);

		require('../../System/deploy');

		console.log('All Ready Tasks have been completed!');
	},
};