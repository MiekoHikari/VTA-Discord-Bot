import './lib/pre-setup/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import mongoose from 'mongoose';

const client = new SapphireClient({
	logger: {
		level: LogLevel.Debug
	},
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.GuildMessageReactions
	],
	defaultCooldown: {delay: 5000},
	loadDefaultErrorListeners: true,
	partials: [Partials.Message, Partials.Channel]
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in as ' + client.user?.username);

		await mongoose.connect(`${process.env.MongoURL}`);
		client.logger.info('Database connected successfully');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
