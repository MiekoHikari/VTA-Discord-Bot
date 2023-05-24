import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { Message, MessageReaction, User } from 'discord.js';
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

		if (reaction.emoji.name === '⭐' && reaction.me && !ongoing) {
			ongoing = true;

			// Wait for reactions for 10 seconds
			const reactions = await message.awaitReactions({
				filter: (reaction) => reaction.emoji.name === '⭐',
				time: 10000
			});

			const reactionCount = reactions.first()?.users.cache.size ?? 1;
			const calculatedExp = reactionCount * 30;

			// Function to give XP to a user
			async function giveUserExp(user: User) {
				let DBuser = await levelProfile.findOne({ DiscordID: user.id });
				if (!DBuser) {
					DBuser = new levelProfile({
						DiscordID: user.id,
						Experience: 0,
						Level: 0,
						LastActivity: new Date().toUTCString(),
						OutOfContextMessages: []
					});
				}

				await giveUserXP(DBuser, calculatedExp);
				await levelManager.updateUserLevel(DBuser, message);
			}

			// Give XP to each user who reacted with ⭐
			reactions.first()?.users.cache.forEach(async (user) => {
				await giveUserExp(user);
			});

			// Send a message announcing the end of the reaction party and delete it after 10 seconds
			message.reply({
				content: `Reaction party ended! ${reactionCount} members reacted within 10 seconds and have been rewarded ${calculatedExp}xp each! 🎉`
			}).then((msg) => {
				setTimeout(() => {
					msg.delete();
				}, 10000);
			});

			// Remove the ⭐ reaction added by the bot
			message.reactions.cache.first()?.remove();
			ongoing = false;
		} else {
			const userID = reaction.users.cache.first()?.id;

			const cooldownDatabase = new Map();
			const cooldown = cooldownDatabase.get(userID);
			if (cooldown != null && cooldown > new Date().getTime()) {
				return;
			}

			let DBuser = await levelProfile.findOne({ DiscordID: userID });
			if (!DBuser) {
				DBuser = new levelProfile({
					DiscordID: userID,
					Experience: 0,
					Level: 0,
					LastActivity: new Date().toUTCString(),
					OutOfContextMessages: []
				});
			}

			await giveUserXP(DBuser, 10);
			await levelManager.updateUserLevel(DBuser, message);

			cooldownDatabase.set(userID, new Date().getTime() + 300000); // Set cooldown for 5 minutes
		}
	}
}
