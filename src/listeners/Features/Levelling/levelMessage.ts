import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { ChannelType, type Message } from 'discord.js';
import levelProfile from '../../../assets/db.models/levelProfile';
import levelManager, { giveUserXP } from '../../../lib/level';

const cooldownDatabase = new Map();


@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate,
	name: 'MessageLevel'
})
export class UserEvent extends Listener {
	public override async run(message: Message) {
		if (message.channel.type === ChannelType.DM) return;
		if (message.author.bot) return;

		const cooldown = cooldownDatabase.get(`${message.author.id}`);
		if (cooldown != null && cooldown > new Date()) {
			return;
		}

		const db = await levelProfile.findOneAndUpdate({ DiscordID: message.author.id }, {});
		const DBuser =
			db != undefined
				? db
				: new levelProfile({
						DiscordID: message.author.id,
						Experience: 0,
						Level: 0,
						LastActivity: new Date().toUTCString(),
						OutOfContextMessages: []
				  });
		
		await giveUserXP(DBuser, (15 * message.content.length / 10));
		await levelManager.updateUserLevel(DBuser, message);

		cooldownDatabase.set(message.author.id, new Date().getTime() + 30000);
	}
}
