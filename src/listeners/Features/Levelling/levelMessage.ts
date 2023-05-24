import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { ChannelType, Message } from 'discord.js';
import levelProfile from '../../../assets/db.models/levelProfile';
import levelManager, { giveUserXP } from '../../../lib/level';

const cooldownDatabase = new Map();

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate,
	name: 'MessageLevel'
})
export class UserEvent extends Listener {
	public override async run(message: Message) {
		// Ignore DM messages and messages from bots
		if (message.channel.type === ChannelType.DM || message.author.bot) {
			return;
		}

		const cooldown = cooldownDatabase.get(message.author.id);
		if (cooldown != null && cooldown > new Date().getTime()) {
			return;
		}

		// Find or create the user's level profile
		let DBuser = await levelProfile.findOne({ DiscordID: message.author.id });
		if (!DBuser) {
			DBuser = new levelProfile({
				DiscordID: message.author.id,
				Experience: 0,
				Level: 0,
				LastActivity: new Date().toUTCString(),
				OutOfContextMessages: []
			});
		}

		// Calculate XP based on message length and give XP to the user
		const calculatedExp = (15 * message.content.length) / 10;
		await giveUserXP(DBuser, calculatedExp);
		await levelManager.updateUserLevel(DBuser, message);

		cooldownDatabase.set(message.author.id, new Date().getTime() + 30000); // Set cooldown for 30 seconds
	}
}
