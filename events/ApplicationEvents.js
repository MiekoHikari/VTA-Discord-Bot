const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle } = require('discord.js');
const Application = require('../Database/Schemas/application');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isButton()) {
			if (interaction.customId == 'create') {
				let userval = await Application.findOne({ userID: interaction.user.id });
				if (!userval) {
					const createDialog = new EmbedBuilder()
						.setColor(0xE0115F)
						.setTitle('Your Profile is ready for customization!')
						.setDescription('Run the apply command again to customize your profile!')
						.setTimestamp()
						.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

					userval = await new Application({
						_id: mongoose.Types.ObjectId(),
						userID: interaction.user.id,
						Status: 'Not Applied',
						AvatarIcon: 'None',
						VTuberName: 'None',
						Description: 'None',
						YouTube: 'None',
						Twitch: 'None',
						Twitter: 'None',
						TikTok: 'None',
					});

					Application.bulkSave([userval]);
					interaction.update({ embeds: [createDialog], components: [], ephemeral: true });
				}
			}

			if (interaction.customId == 'reapply') {
				// eslint-disable-next-line prefer-const
				let cApp = await Application.findOne({ userID: interaction.user.id });
				if (cApp.Status == 'approved') {
					cApp.Status = 'Not Applied';

					interaction.member.roles.remove(process.env.VTUBERROLE, 'Manual Reapplication request');
					Application.bulkSave([cApp]);
					await interaction.update({ content: 'Your profile has been reverted!', ephemeral: true });
				}
				else {
					const embed = new EmbedBuilder()
						.setColor(0xE0115F)
						.setTitle('Uh oh! You do not have an approved profile :C')
						.setDescription('Use the apply command to submit an application!');
					await interaction.update({ embeds: [embed], ephemeral: true });
				}
			}

			if (interaction.customId == 'Submit') {
				const embed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('Do you really want to submit?')
					.setDescription('Once you submit an application, your profile will be locked and cannot be withdrawn until you get accepted or rejected!');

				const rows = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('sureSubmit')
							.setLabel('Yes, I\'m sure I want to submit! ✅')
							.setStyle(ButtonStyle.Danger),
					);
				await interaction.reply({ embeds: [embed], ephemeral: true, components: [rows] });
			}

			if (interaction.customId == 'sureSubmit') {
				const embed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('User Profile Submitted')
					.setDescription('Your application has been submitted successfully.');

				const userval = await Application.findOne({ userID: interaction.user.id });

				userval.Status = 'pending';
				userval.save();

				const profEmbed = new EmbedBuilder()
					.setColor('Random')
					.setTitle(`${userval.VTuberName}`)
					.setDescription(`${userval.Description}`)
					.setTimestamp();

				if (!(userval.YouTube == 'None')) {
					profEmbed.addFields({ name: 'YouTube Channel', value: `${userval.YouTube}`, inline: true });
				}

				if (!(userval.Twitch == 'None')) {
					profEmbed.addFields({ name: 'Twitch Channel', value: `${userval.Twitch}`, inline: true });
				}

				if (!(userval.Twitter == 'None')) {
					profEmbed.addFields({ name: 'Twitter', value: `${userval.Twitter}`, inline: true });
				}

				if (!(userval.TikTok == 'None')) {
					profEmbed.addFields({ name: 'TikTok', value: `${userval.TikTok}`, inline: true });
				}

				profEmbed.setImage(`${userval.AvatarIcon}`);
				const guildMember = await interaction.guild.members.fetch(interaction.user.id);

				const userInfo = new EmbedBuilder()
					.setColor('Random')
					.setTitle('Additional Author Information')
					.setDescription('Discord user information thats not visible to the naked eye, watch out for suspicious users!')
					.addFields(
						{ name: 'User:', value: `${interaction.user.tag}`, inline: true },
						{ name: 'Account Creation Date:', value: `${dayjs(interaction.user.createdAt)}`, inline: true },
						{ name: 'Server Join Date:', value: `${dayjs(guildMember.joinedAt)}` },
						{ name: 'Boosting since:', value: `${dayjs(guildMember.premiumSince)}` },
					);

				const rows = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('approveProfile')
							.setLabel('Approve ✅')
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId('denyProfile')
							.setLabel('Reject ❌')
							.setStyle(ButtonStyle.Secondary),
					);

				// When deploying, chance the channel id to moderation channel.
				await interaction.guild.channels.cache.get(process.env.APPLICATIONCHANNEL).send({ content: `${userval._id}`, embeds: [profEmbed, userInfo], components: [rows] });

				await interaction.update({ embeds: [embed], ephemeral: true, components: [] });
			}

			if (interaction.customId == 'approveProfile') {
				const userProfile = await Application.findOne({ _id: interaction.message.content });

				userProfile.Status = 'approved';
				userProfile.save();

				const guildMember = await interaction.guild.members.fetch(userProfile.userID);

				await guildMember.roles.add(process.env.VTUBERROLE, `VTuber Application approved by ${interaction.user.tag}`);

				// eslint-disable-next-line no-unused-vars
				const funButton = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('funbuttondoesabsolutelynothing')
							.setLabel(`Profile approved by ${interaction.user.tag}!`)
							.setStyle(ButtonStyle.Success),
					);

				interaction.update({ content: '', components: [funButton] });
			}

			if (interaction.customId == 'denyProfile') {
				const userProfile = await Application.findOne({ _id: interaction.message.content });

				userProfile.Status = 'Not Applied';
				userProfile.save();

				const modal = new ModalBuilder()
					.setCustomId('reasonModal')
					.setTitle('Enter a reason');

				const responseModal = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel('This will be sent to the user.')
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true);

				const firstActionRow = new ActionRowBuilder().addComponents(responseModal);

				modal.addComponents(firstActionRow);

				await interaction.showModal(modal);
			}
		}

		if (interaction.customId == 'reasonModal') {
			await interaction.deferUpdate();

			const userProfile = await Application.findOne({ _id: interaction.message.content });
			const reason = interaction.fields.getTextInputValue('reasonInput');

			const reEmbed = new EmbedBuilder()
				.setColor(0xE0115F)
				.setTitle('Your profile was rejected.')
				.setDescription(`${reason}`)
				.setTimestamp();

			const guildMember = await interaction.guild.members.fetch(userProfile.userID);
			guildMember.send({ embeds: [reEmbed] });

			const funButton = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('funbuttondoesabsolutelynothing')
						.setLabel(`Profile rejected by ${interaction.user.tag}!`)
						.setStyle(ButtonStyle.Danger),
				);

			await interaction.editReply({ content: `reason ${reason}`, components: [funButton] });
		}
	},
};