const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const modmailDB = require('../Database/Schemas/modmail');
const mongoose = require('mongoose');

const { processing } = require('./ProfileBuilder');

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (processing.has(message.author.id)) return;
		if (message.author.bot) return;

		let userIDs = null;

		if (message.guild && message.channel.isThread() && message.channel.parentId == process.env.MODMAILLOGCHANNEL) {
			userIDs = message.channel.name.slice(0, 18).replace(/\s/g, '');
			const modmailUser = await modmailDB.findOne({ userID: userIDs });
			const UserStatus = modmailUser.Status;

			if (!modmailUser) { return message.channel.send('Please send atleast 1 DM to me to use modmail.'); }

			if (UserStatus == 'Open') {
				const userChannel = await message.client.channels.fetch(modmailUser.channelID);

				if (message.content.startsWith('!')) {
					return;
				}

				if (message.content.startsWith('=close')) {
					let reason = message.content.replace('=close ', '');
					if (reason.startsWith('=close')) {
						reason = 'No Reason Provided.';
					}

					const LEmbed = new EmbedBuilder()
						.setColor('Red')
						.setTitle('Channel has been unlinked!')
						.addFields(
							{ name: 'Moderator:', value: `${message.author.tag}`, inline: false },
							{ name: 'Reason:', value: `${reason}`, inline: false },
						);

					message.channel.send({ embeds: [LEmbed] });

					modmailUser.Status = 'Closed';
					modmailUser.LastRecord = modmailUser.CurrentChannel;
					modmailUser.CurrentChannel = 'None';
					modmailUser.save();

					userChannel.send({ embeds: [LEmbed] });
					await message.channel.send('⚠️ Re-opening this thread won\'t re-link channels. ⚠️');
					await message.channel.setLocked(true).then(async () => {
						try {
							await message.channel.setArchived(true);
						}
						catch (error) {
							null;
						}
					});

					const ModMailServer = await message.client.guilds.fetch(process.env.GUILDID);
					const ModMailChannel = await ModMailServer.channels.fetch(process.env.MODMAILLOGCHANNEL);
					const webhooks = await ModMailChannel.fetchWebhooks();
					webhooks.forEach(async wh => {
						if (message.channel.name.endsWith(wh.name)) {
							wh.delete();
						}
					});
					return;
				}

				const mEmbed = new EmbedBuilder()
					.setColor(0x2F3136)
					.setAuthor({ name: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL()}` });

				const LEmbed = new EmbedBuilder()
					.setColor(0x2F3136)
					.setAuthor({ name: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL()}` });

				if (message.content.startsWith('-')) {
					mEmbed.setAuthor({ name: 'VTA Staff' });
					LEmbed.setAuthor({ name: 'VTA Staff' });
					message.react('☑️');
				}
				else {
					message.react('✅');
				}

				if (message.content) {
					let content = message.content;
					if (message.content.startsWith('-')) { content = message.content.substring(1); }
					mEmbed.setDescription(`${content}`);
					userChannel.send({ embeds: [mEmbed] });
				}

				const Attachments = await message.attachments;
				Attachments.forEach(attachment => {
					userChannel.send({ embeds: [LEmbed], files: [attachment.url] });
				});
			}
		}

		if (!message.guild) {
			userIDs = message.author.id;
			let modmailUser = await modmailDB.findOne({ userID: userIDs });
			const UserStatus = modmailUser.Status;

			if (!modmailUser) {
				await message.channel.send('Couldn\'t find user in mmDB, creating...').then(async remessage => {
					modmailUser = await new modmailDB({
						_id: mongoose.Types.ObjectId(),
						userID: message.author.id,
						channelID: message.channel.id,
						Status: 'Closed',
						CurrentChannel: 'None',
						LastRecord: 'None',
					});

					await modmailUser.save();
					modmailUser = await modmailDB.findOne({ userID: userIDs });
					await remessage.edit('Profile created successfully!');
				});
			}

			if (UserStatus == 'Closed') {
				const ConfirmButton = new ButtonBuilder()
					.setCustomId('mm-confirm')
					.setLabel('Confirm')
					.setStyle(ButtonStyle.Primary);

				const confirmRow = new ActionRowBuilder().addComponents(ConfirmButton);

				const aEmbed = new EmbedBuilder()
					.setColor('Fuchsia')
					.setAuthor('VTA ModMail')
					.setTitle('Would you like to create a new conversation?')
					.setDescription('This will open a tunnel between you and the server moderators.')
					.setTimestamp();

				message.channel.send({ embeds: [aEmbed], components: [confirmRow], content: `${message.id}` });
			}

			if (UserStatus == 'Open') {
				const ModMailServer = await message.client.guilds.fetch(process.env.GUILDID);
				const ModMailChannel = await ModMailServer.channels.fetch(process.env.MODMAILLOGCHANNEL);
				const webhooks = await ModMailChannel.fetchWebhooks();

				let webhook = null;
				webhooks.forEach(async wh => {
					if (wh.name == message.author.username) {
						webhook = wh;
					}
				});

				if (message.content) {
					webhook.send({ threadId: modmailUser.CurrentChannel, content: message.content });
				}

				if (message.attachments) {
					const Attachments = await message.attachments;
					Attachments.forEach(attachment => {
						webhook.send({ threadId: modmailUser.CurrentChannel, files: [attachment.url] });
					});
				}

				message.react('✅');
			}
		}
	},
};
