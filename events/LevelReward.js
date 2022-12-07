const { Events } = require('discord.js');
const Levels = require('discord-xp');

const cooldown = new Set();
const excludedId = ['757259446110912552', '765201358776303636', '747857158976176241', '798632840517517343'];

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		// Basic Validation
		if (message.author.bot) return;
		if (message.channel.type == 'DM') return;
		if (message.content.length < 5) return;

		if (!message.guild) {
			return;
		}

		// If the message is in the prementioned IDs, then ignore.
		if (excludedId.includes(`${message.channel.id}`, 0)) {
			return;
		}

		// If the user is in cooldown, ignore
		if (cooldown.has(message.author.id)) {
			return;
		}
		else {
			const randomXp = Math.floor(Math.random() * 29) + 1;
			const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXp);

			if (hasLeveledUp) {
				message.react('⭐');
			}
		}

		// Add the user to a cooldown
		cooldown.add(message.author.id);
		setTimeout(() => {
			cooldown.delete(message.author.id);
		}, 10000);
	},
};
