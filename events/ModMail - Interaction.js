const { Events, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const mmDB = require('../Database/Schemas/modmail');
const Dayjs = require('dayjs');
dotenv.config();

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const client = await interaction.client;

		if (interaction.isButton()) {
			if (interaction.customId == 'mm-confirm') {
				const ModMailServer = await client.guilds.fetch(process.env.GUILDID);
				const ModMailChannel = await ModMailServer.channels.fetch(process.env.MODMAILLOGCHANNEL);
				const ModMailProfile = await mmDB.findOne({ userID: interaction.user.id });
				const userChannel = await client.channels.fetch(ModMailProfile.channelID);
				const UserMessage = await userChannel.messages.fetch(interaction.message.content);

				const whs = await ModMailChannel.fetchWebhooks();
				if (whs.size == 10) {
					return interaction.channel.send('The ModMail inbox is currently full! We\'re sorry for the inconvenience :c');
				}

				const guildMember = await ModMailServer.members.fetch(interaction.user.id);
				const newMail = new EmbedBuilder()
					.setColor('Green')
					.setTitle('Start of conversation')
					.setDescription('This chat is now linked with ' + interaction.user.tag)
					.addFields(
						{ name: 'Thread Creation Time', value: `${Dayjs(Date.now())}`, inline: true },
						{ name: 'User', value: `<@${interaction.user.id}>`, inline: true },
						{ name: 'Roles', value: guildMember.roles.cache.map(roles => `${roles}`).join(', '), inline: false },
					)
					.setThumbnail(interaction.user.displayAvatarURL())
					.setTimestamp();

				const ModmailLastRecord = ModMailProfile.LastRecord;
				if (!(ModmailLastRecord == 'None')) {
					newMail.addFields({ name: 'Last Created Thread', value: `<#${ModmailLastRecord}>`, inline: false });
				}

				const success = new EmbedBuilder()
					.setColor('Green')
					.setTitle('This chat is now linked with a staff channel!')
					.setDescription('Every message and attachment you send is going to be sent to a staff channel. Rules applies here too.')
					.setTimestamp();

				const thread = await ModMailChannel.threads.create({
					name: `${interaction.user.id} - ${interaction.user.username}`,
					message: { embeds: [newMail] },
				});
				ModMailProfile.CurrentChannel = thread.id;
				ModMailProfile.Status = 'Open';

				ModMailChannel.createWebhook({
					name: interaction.user.username,
					avatar: interaction.user.displayAvatarURL(),
				})
					.then(webhook => {
						if (UserMessage.content) {
							webhook.send({ threadId: thread.id, content: UserMessage.content });
						}
						if (UserMessage.attachments) {
							const Attachments = UserMessage.attachments;
							Attachments.forEach(attachment => {
								webhook.send({ threadId: thread.id, files: [attachment.url] });
							});
						}
					});

				await ModMailProfile.save();
				return interaction.message.edit({ content: null, embeds: [success], components: [] });
			}
		}
	},
};
