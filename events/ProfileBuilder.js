const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Application = require('../Database/Schemas/application');

const fs = require('fs');
const http = require('http');
const https = require('https');

const processing = new Set();

module.exports = {
	name: Events.InteractionCreate,
	processing: processing,
	async execute(interaction) {

		// eslint-disable-next-line prefer-const
		let userval = await Application.findOne({ userID: interaction.user.id });

		const row1 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('vtubername')
					.setLabel('Set VTuber Name')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('description')
					.setLabel('Set Description')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('avatarbut')
					.setLabel('Set Avatar')
					.setStyle(ButtonStyle.Primary),
			);

		const row2 = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('youtube')
					.setLabel('Set YouTube')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('twitch')
					.setLabel('Set Twitch')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('twitter')
					.setLabel('Set Twitter')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('tiktok')
					.setLabel('Set TikTok')
					.setStyle(ButtonStyle.Primary),
			);

		if (interaction.isButton()) {

			if (interaction.customId == 'profilebuilder') {

				if (userval.Status == 'approved') {
					const validEmbed = new EmbedBuilder()
						.setColor(0xE0115F)
						.setTitle('You already have an approved profile! ✅')
						.setDescription('Use the profile command to see your information! If you want to change your profile, you may need to go through the application procedure and **you may lose your VTuber Role**. Are you sure?');

					const createRow = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('reapply')
								.setLabel('I want to reapply 🗃️')
								.setStyle(ButtonStyle.Secondary),
						);
					await interaction.editReply({ embeds: [validEmbed], ephemeral: true, components: [createRow] });
				}
				// eslint-disable-next-line prefer-const
				let customEmbed = new EmbedBuilder()
					.setColor(0x0F52BA)
					.setTitle('The PB Menu!')
					.setDescription('Your Only and (probably) favorite tool to edit your VTA Candidate Information!')
					.setTimestamp()
					.setFooter({ text: 'If you run into any issues, please contact VTA Staff' });

				if (userval.VTuberName == 'None' && userval.Description == 'None') {
					customEmbed.addFields({ name: 'VTuber Name not provided. ', value: 'Description not provided' });
				}
				else if (userval.VTuberName != 'None' && userval.Description == 'None') {
					customEmbed.addFields({ name: `${userval.VTuberName}`, value: 'Description not provided' });
				}
				else if (userval.VTuberName == 'None' && userval.Description != 'None') {
					customEmbed.addFields({ name: 'VTuber Name not provided', value: `${userval.Description}` });
				}
				else if (userval.VTuberName != 'None' && userval.Description != 'None') {
					customEmbed.addFields({ name: `${userval.VTuberName}`, value: `${userval.Description}` });
				}

				if (userval.Youtube == 'None') {
					customEmbed.addFields({ name: 'YouTube', value: 'YouTube Link not provided', inline: true });
				}
				else {
					customEmbed.addFields({ name: 'YouTube', value: `${userval.YouTube}`, inline: true });
				}

				if (userval.Twitch == 'None') {
					customEmbed.addFields({ name: 'Twitch', value: 'Twitch Link not provided', inline: true });
				}
				else {
					customEmbed.addFields({ name: 'Twitch', value: `${userval.Twitch}`, inline: true });
				}

				if (userval.Twitter == 'None') {
					customEmbed.addFields({ name: 'Twitter', value: 'Twitter Link not provided', inline: true });
				}
				else {
					customEmbed.addFields({ name: 'Twitter', value: `${userval.Twitter}`, inline: true });
				}

				if (userval.TikTok == 'None') {
					customEmbed.addFields({ name: 'TikTok', value: 'TikTok Link not provided', inline: true });
				}
				else {
					customEmbed.addFields({ name: 'TikTok', value: `${userval.TikTok}`, inline: true });
				}

				interaction.reply({ embeds: [customEmbed], ephemeral: true, components: [row1, row2] });
			}

			if (interaction.customId == 'vtubername') {
				const vtubernamemodal = new ModalBuilder()
					.setCustomId('vtubernamemodal')
					.setTitle('🎨 VTA Profile Builder');

				const vtubernameinput = new TextInputBuilder()
					.setCustomId('vtubernameinput')
					.setLabel('Enter your VTuber Name!')
					.setStyle(TextInputStyle.Short);

				const ActionRow = new ActionRowBuilder().addComponents(vtubernameinput);

				vtubernamemodal.addComponents(ActionRow);

				await interaction.showModal(vtubernamemodal);
			}

			if (interaction.customId == 'description') {
				const vtubernamemodal = new ModalBuilder()
					.setCustomId('descriptionmodal')
					.setTitle('🎨 VTA Profile Builder');

				const vtubernameinput = new TextInputBuilder()
					.setCustomId('descriptioninput')
					.setLabel('Tell us a little bit about your self!')
					.setStyle(TextInputStyle.Paragraph);

				const ActionRow = new ActionRowBuilder().addComponents(vtubernameinput);

				vtubernamemodal.addComponents(ActionRow);

				await interaction.showModal(vtubernamemodal);
			}

			if (interaction.customId == 'youtube') {
				const vtubernamemodal = new ModalBuilder()
					.setCustomId('youtubemodal')
					.setTitle('🎨 VTA Profile Builder');

				const vtubernameinput = new TextInputBuilder()
					.setCustomId('youtubeinput')
					.setLabel('Present your Youtube Link')
					.setStyle(TextInputStyle.Short);

				const ActionRow = new ActionRowBuilder().addComponents(vtubernameinput);

				vtubernamemodal.addComponents(ActionRow);

				await interaction.showModal(vtubernamemodal);
			}

			if (interaction.customId == 'twitch') {
				const vtubernamemodal = new ModalBuilder()
					.setCustomId('twitchmodal')
					.setTitle('🎨 VTA Profile Builder');

				const vtubernameinput = new TextInputBuilder()
					.setCustomId('twitchinput')
					.setLabel('Present your Twitch Link')
					.setStyle(TextInputStyle.Short);

				const ActionRow = new ActionRowBuilder().addComponents(vtubernameinput);

				vtubernamemodal.addComponents(ActionRow);

				await interaction.showModal(vtubernamemodal);
			}

			if (interaction.customId == 'twitter') {
				const vtubernamemodal = new ModalBuilder()
					.setCustomId('twittermodal')
					.setTitle('🎨 VTA Profile Builder');

				const vtubernameinput = new TextInputBuilder()
					.setCustomId('twitterinput')
					.setLabel('Present your Twitter Link')
					.setStyle(TextInputStyle.Short);

				const ActionRow = new ActionRowBuilder().addComponents(vtubernameinput);

				vtubernamemodal.addComponents(ActionRow);

				await interaction.showModal(vtubernamemodal);
			}

			if (interaction.customId == 'tiktok') {
				const vtubernamemodal = new ModalBuilder()
					.setCustomId('tiktokmodal')
					.setTitle('🎨 VTA Profile Builder');

				const vtubernameinput = new TextInputBuilder()
					.setCustomId('tiktokinput')
					.setLabel('Present your TikTok Link')
					.setStyle(TextInputStyle.Short);

				const ActionRow = new ActionRowBuilder().addComponents(vtubernameinput);

				vtubernamemodal.addComponents(ActionRow);

				await interaction.showModal(vtubernamemodal);
			}

			if (interaction.customId == 'avatarbut') {
				processing.add(interaction.member.id);

				const interEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('We have taken this to your DMs 💼')
					.setDescription('"Don\'t take this personally, Its just how things are." If you haven\'t received a DM, please make sure your inbox is open!');
				await interaction.reply({ embeds: [interEmbed], components: [row1, row2], ephemeral: true });

				const dealer = await interaction.member.send('You have 1 minute, give me the goods 💸 (Your Avatar)');

				const filter = (m) =>
					m.author.id === interaction.member.id;

				const collector = dealer.channel.createMessageCollector(filter, {
					max: 1,
					time: 60000,
				});

				collector.on('collect', async m => {
					const attachment = m.attachments.first();

					if (attachment) {
						// Validate the image (if discord regonizes that this is an image)
						if (!attachment.contentType.startsWith('image')) {
							const failEmbed = new EmbedBuilder()
								.setColor(0xE0115F)
								.setTitle('Failed to read image from discord')
								.setDescription('Image validation failed. Please upload an image! Commonly supported formats are JPEG and PNG.');

							return m.channel.send({ embeds: [failEmbed] });
						}

						const downloadImageToUrl = (url, filename) => {
							let client = http;
							if (url.toString().indexOf('https') === 0) {
								client = https;
							}
							return new Promise((resolve, reject) => {
								client.get(url, (res) => {
									res.pipe(fs.createWriteStream(filename))
										.on('error', reject)
										.once('close', () => resolve(filename));
								});
							});
						};

						const expectedPath = `./Storage/Avatars/${interaction.member.id}.png`;

						// eslint-disable-next-line no-unused-vars
						const avatarPNG = await downloadImageToUrl(`${attachment.url}`, expectedPath);

						m.channel.send('*The cat snatches your PNG, shoves it in a briefcase and runs away* (Avatar Saved)');
					}
					else {
						m.channel.send('This isn\'t what I asked for, please try again later');
					}

					collector.stop();
				});

				collector.on('end', () => processing.delete(interaction.member.id));
			}
		}

		if (interaction.isModalSubmit()) {
			if (interaction.customId == 'vtubernamemodal') {
				await interaction.deferUpdate();

				const vtubername = interaction.fields.getTextInputValue('vtubernameinput');

				userval.VTuberName = vtubername;
				await userval.save();
				userval = await Application.findOne({ userID: interaction.user.id });

				const modalEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('Your VTuber Name has been updated!')
					.setDescription(`Your VTuber Name is now ${vtubername}`)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

				await interaction.editReply({ embeds: [modalEmbed], components: [row1, row2] });
			}

			if (interaction.customId == 'descriptionmodal') {
				await interaction.deferUpdate();

				const vtubername = interaction.fields.getTextInputValue('descriptioninput');

				userval.Description = vtubername;
				await userval.save();
				userval = await Application.findOne({ userID: interaction.user.id });

				const modalEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('Your Description has been updated!')
					.setDescription(`${vtubername}`)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

				await interaction.editReply({ embeds: [modalEmbed], components: [row1, row2] });
			}

			if (interaction.customId == 'youtubemodal') {
				await interaction.deferUpdate();

				const vtubername = interaction.fields.getTextInputValue('youtubeinput');

				userval.YouTube = vtubername;
				await userval.save();
				userval = await Application.findOne({ userID: interaction.user.id });

				// eslint-disable-next-line no-unused-vars
				const modalEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('Your Youtube Link has been updated!')
					.setDescription(`New URL: ${vtubername}`)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });
				await interaction.editReply({ embeds: [modalEmbed], components: [row1, row2] });
			}

			if (interaction.customId == 'twitchmodal') {
				await interaction.deferUpdate();

				const vtubername = interaction.fields.getTextInputValue('twitchinput');

				userval.Twitch = vtubername;
				await userval.save();
				userval = await Application.findOne({ userID: interaction.user.id });

				// eslint-disable-next-line no-unused-vars
				const modalEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('Your Twitch Link has been updated!')
					.setDescription(`New URL: ${vtubername}`)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });
				await interaction.editReply({ embeds: [modalEmbed], components: [row1, row2] });
			}

			if (interaction.customId == 'twittermodal') {
				await interaction.deferUpdate();

				const vtubername = interaction.fields.getTextInputValue('twitterinput');

				userval.Twitter = vtubername;
				await userval.save();
				userval = await Application.findOne({ userID: interaction.user.id });

				const modalEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('Your Twitter Link has been updated!')
					.setDescription(`New URL: ${vtubername}`)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });
				await interaction.editReply({ embeds: [modalEmbed], components: [row1, row2] });
			}

			if (interaction.customId == 'tiktokmodal') {
				await interaction.deferUpdate();

				const vtubername = interaction.fields.getTextInputValue('tiktokinput');

				userval.TikTok = vtubername;
				await userval.save();
				userval = await Application.findOne({ userID: interaction.user.id });

				const modalEmbed = new EmbedBuilder()
					.setColor(0x50C878)
					.setTitle('Your TikTok Link has been updated!')
					.setDescription(`New URL: ${vtubername}`)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });
				await interaction.editReply({ embeds: [modalEmbed], components: [row1, row2] });
			}
		}
	},
};