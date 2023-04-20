const { Events } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Connected to Discord as: ${client.user.tag}`);

		require('../../System/deploy');

		console.log('Connecting to MongoDB...');
		await mongoose.connect(process.env.DatabaseURL || '', {
			keepAlive: true,
		});

		if (mongoose.connect) {
			console.log('The Database has been successfully connected!');
		}

		console.log('All Ready Tasks have been completed!');
	},
};