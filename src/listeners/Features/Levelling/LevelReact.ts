import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Message, MessageReaction, User } from 'discord.js';
import levelProfile from '../../../assets/db.models/levelProfile';
import levelManager, { giveUserXP } from '../../../lib/level';

let ongoing = false;

@ApplyOptions<Listener.Options>({
	event: Events.MessageReactionAdd,
	name: 'ReactLevel'
})
export class UserEvent extends Listener {
	public override async run(reaction: MessageReaction) {
		const message = reaction.message as Message;

		if (reaction.emoji.name === '⭐' && reaction.me && ongoing === false) {
			ongoing = true;

			const reactions = await message.awaitReactions({
				filter: (reaction) => reaction.emoji.name === '⭐',
				time: 10000
			});

			const reactionCount = reactions.first()?.users.cache.size ?? 1;
			const calculatedExp = reactionCount * 30;

			async function giveUserExp(user: User) {
				const db = await levelProfile.findOneAndUpdate({ DiscordID: user.id }, {});
				const DBuser =
					db != undefined
						? db
						: new levelProfile({
								DiscordID: user.id,
								Experience: 0,
								Level: 0,
								LastActivity: new Date().toUTCString(),
								OutOfContextMessages: []
						  });

				await giveUserXP(DBuser, calculatedExp);
				await levelManager.updateUserLevel(DBuser, message);
			}

			reactions.first()?.users.cache.forEach(async (user) => {
				giveUserExp(user);
			});

			message
				.reply({
					content: `Reaction party ended! ${reactionCount} members reacted within 10 seconds and have been rewarded ${calculatedExp}xp each! 🎉`
				})
				.then((msg) => {
					setTimeout(() => {
						msg.delete();
					}, 10000);
				});
			
			message.reactions.cache.first()?.remove()
			ongoing = false;
		} else {
			const userID = reaction.users.cache.first()?.id;

			const cooldownDatabase = new Map();
			const cooldown = cooldownDatabase.get(`${userID}`);
			if (cooldown != null && cooldown > new Date()) {
				return;
			}

			const db = await levelProfile.findOneAndUpdate({ DiscordID: userID }, {});
			const DBuser =
				db != undefined
					? db
					: new levelProfile({
							DiscordID: userID,
							Experience: 0,
							Level: 0,
							LastActivity: new Date().toUTCString(),
							OutOfContextMessages: []
					  });

			await giveUserXP(DBuser, 10);
			await levelManager.updateUserLevel(DBuser, message);

			cooldownDatabase.set(userID, new Date().getTime() + 300000);
		}
	}
}
