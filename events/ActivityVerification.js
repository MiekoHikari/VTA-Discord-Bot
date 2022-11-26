const { Events } = require('discord.js');
const Application = require('../Database/Schemas/application.js');
const Levels = require('../Database/Schemas/levels.js');
const daysjs = require('dayjs');

const cooldown = new Set();

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		const apps = await Application.find({});

		if (cooldown.has(message.author.id)) { return;}

		apps.forEach(async (lications) => {
			const LevelProfile = await Levels.findOne({ userID: lications.userID });

			if (!LevelProfile) {
				return;
			}

			if (lications.Status != 'approved') {
				return;
			}

			const today = daysjs(Date.now());
			const lastUpdated = daysjs(LevelProfile.lastUpdated);
			const duration = today.diff(lastUpdated, 'd');
			// Set unit to days and set the duration to 3 days

			let member = null;
			try { member = await message.guild.members.fetch(LevelProfile.userID); }
			catch (err) { return; }

			if (duration > 5) {
				// change to vtuber role
				if (member.roles.cache.has('747491394284945530')) {
					member.roles.remove('747491394284945530', 'inactivity');
					member.send('You have lost your vtuber role due to inactivity, you may recover it by interacting with VTA.');
				}
			}
			else if (duration < 5) {
				if (!member.roles.cache.has('747491394284945530')) {
					member.roles.add('747491394284945530', 'User regained activity!');
					member.send('Welcome back! You\'ve gained your vtuber role!');
				}
			}
		});

		cooldown.add(message.author.id);
		setTimeout(() => {
			cooldown.delete(message.author.id);
		}, 10000);
		// Set the cooldown to an hour when deploying;
	},
};