import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { EmbedBuilder, type Message, ChannelType } from 'discord.js';
import levelManager from '../../../lib/level';
import levelProfile from '../../../assets/db.models/levelProfile';

@ApplyOptions<Listener.Options>({
	event: 'LevelUp',
	emitter: levelManager,
	name: 'LevelUp'
})
export class UserEvent extends Listener {
	public override async run(message: Message, userID: string) {
		const db = await levelProfile.findOneAndUpdate({ DiscordID: userID }, {});
		const DBuser =
			db != undefined
				? db
				: new levelProfile({
						DiscordID: userID,
						Experience: 0,
						Level: 0,
						LastActivity: new Date().toUTCString(),
						OutOfContextMessages: [],
						Knows: false,
				  });

		if (DBuser.Level === 1 && DBuser.Knows === false) {
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
			DBuser.Knows === true;
		}

		DBuser.OutOfContextMessages.push(message.content);
		await DBuser.save();

		if (message.channel.type != ChannelType.GuildText) return;

		message.react('⭐');
	}
}
