import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { EmbedBuilder, Message, ChannelType } from 'discord.js';
import levelManager from '../../../lib/level';
import levelProfile from '../../../assets/db.models/levelProfile';

@ApplyOptions<Listener.Options>({
	event: 'LevelUp',
	emitter: levelManager,
	name: 'LevelUp'
})
export class UserEvent extends Listener {
	public override async run(message: Message, userID: string) {
		// Find or create the user's level profile
		let DBuser = await levelProfile.findOne({ DiscordID: userID });
		if (!DBuser) {
			DBuser = new levelProfile({
				DiscordID: userID,
				Experience: 0,
				Level: 0,
				LastActivity: new Date().toUTCString(),
				OutOfContextMessages: [],
				Knows: false
			});
		}

		// Send a new feature notification if the user is leveling up for the first time
		if (DBuser.Level === 1 && !DBuser.Knows) {
			const embed = new EmbedBuilder()
				.setColor('Gold')
				.setTitle('You discovered a new feature! 🎉')
				.setDescription(
					'Messages that are reacted with a ⭐ means that the user has levelled up! Participate in the reaction party follow up to gain bonus XP!'
				)
				.setTimestamp()
				.addFields(
					{ name: 'Sending a message', value: '(15xp x Message content length) divided by 5 - per minute', inline: true },
					{ name: 'Reacting a message', value: '15xp every 5 minutes', inline: true },
					{ name: 'React Party', value: '30xp awarded on every user reacted!', inline: true }
				)
				.setFooter({ text: 'This is a one-time notification.' });

			message.author.send({ embeds: [embed] });

			// Update the user's profile to mark that they have received the notification
			DBuser.Knows = true;
		}

		// Add the message content to the out of context messages array
		DBuser.OutOfContextMessages.push(message.content);

		// Save the updated user profile
		await DBuser.save();

		// React to the message with a ⭐ if it is in a guild text channel
		if (message.channel.type === ChannelType.GuildText) {
			message.react('⭐');
		}
	}
}
