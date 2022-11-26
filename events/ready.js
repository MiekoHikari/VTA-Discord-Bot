const { Events, ActivityType } = require('discord.js');
const mongoose = require('mongoose');

const Application = require('../Database/Schemas/application');
const dayjs = require('dayjs');

const dotenv = require('dotenv');
dotenv.config();

const Levels = require('discord-xp');
const schedule = require('node-schedule');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await mongoose.connect(process.env.DBCONNECTIONSTRING, {
			keepAlive: true,
		});
		await Levels.setURL(process.env.DBCONNECTIONSTRING);

		client.user.setActivity('the cat (Do not the cat)', { type: ActivityType.Watching });
		client.user.setStatus('dnd');

		console.log(`Ready! Logged in as ${client.user.tag}`);

		schedule.scheduleJob('*/5 * * * *', async () => {
			const apps = await Application.find({});

			apps.forEach(async (lications) => {
				const LevelProfile = await Levels.findOne({ userID: lications.userID });

				if (!LevelProfile) {
					return;
				}

				if (lications.Status != 'approved') {
					return;
				}

				const today = dayjs(Date.now());
				const lastUpdated = dayjs(LevelProfile.lastUpdated);
				const duration = today.diff(lastUpdated, 'd');

				const guild = await client.guilds.fetch(process.env.GUILDID);
				let member = null;

				try { member = await guild.members.fetch(LevelProfile.userID); }
				catch (err) { return; }

				if (duration > 5) {
					if (member.roles.cache.has(process.env.VTUBERROLE)) {
						member.roles.remove(process.env.VTUBERROLE, 'inactivity for over 5 days');
						member.send('You have lost your vtuber role due to inactivity for over 5 days, you may recover it by interacting with VTA.');
					}
				}
				else if (duration < 5) {
					if (!member.roles.cache.has(process.env.VTUBERROLE)) {
						member.roles.add(process.env.VTUBERROLE, 'User regained activity!');
						member.send('Welcome back! You\'ve gained your vtuber role!');
					}
				}
			});
		});
	},
};
