const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const Application = require('../Database/Schemas/application');
const mongoose = require('mongoose');
const dayjs = require('dayjs');
require('dotenv').config();

// Constants
let VTuberRoleID;
let ApplicationReviewChannelID;

if (process.env.ENVTYPE === 'DEV') {
	VTuberRoleID = '1045364663392665691';
	ApplicationReviewChannelID = '1046124336140005459';
}
else {
	VTuberRoleID = '747491394284945530';
	ApplicationReviewChannelID = '940162459568832512';
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Validate if the interaction is a button
		if (interaction.isButton()) {
			// Look for the button with an id of "create"
			if (interaction.customId == 'create') {
				// Find the user profile
				let userval = await Application.findOne({ userID: interaction.user.id });

				// Validate the profile
				if (!userval) {
					const createDialog = new EmbedBuilder()
						.setColor(0xE0115F)
						.setTitle('Congrats! You are now in the Registry book!')
						.setDescription('This is your first step towards getting VTA\'s official VTuber Role!')
						.addFields(
							{ name: 'What\'s Next?', value: 'Use the "Application Builder" to start filling up your brand new **profile!**' },
						)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

					// Create a new document in the database
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

					// Save the document
					await userval.save();
					// Send the user the success message
					await interaction.update({ embeds: [createDialog], components: [], ephemeral: true });
				}
			}

			// If the user wants to reapply
			if (interaction.customId == 'reapply') {
				// eslint-disable-next-line prefer-const
				let cApp = await Application.findOne({ userID: interaction.user.id });
				if (cApp.Status == 'approved') {
					cApp.Status = 'Not Applied';

					interaction.member.roles.remove(VTuberRoleID, 'Manual Reapplication request');
					cApp.save();
					await interaction.update({ content: 'Your profile has been reverted!', ephemeral: true });
				}
				else {
					const embed = new EmbedBuilder()
						.setColor(0xE0115F)
						.setTitle('Uh oh! You do not have an approved profile :C')
						.setDescription('Use Application commands to submit an application!');
					await interaction.update({ embeds: [embed], ephemeral: true });
				}
			}

			// If the user is submitting a profile
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

			// Confirmed the candidate's submission
			if (interaction.customId == 'sureSubmit') {
				// Get the necessary information
				const guildMember = await interaction.guild.members.fetch(interaction.user.id);

				// Create an embed for the user to see
				const embed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('User Profile Submitted')
					.setDescription('Your profile has been sent to application officers for review.');

				// get their database document
				const userval = await Application.findOne({ userID: interaction.user.id });

				// Update their status thus officially locking their profile
				userval.Status = 'pending';
				userval.save();

				// create a profile menu for moderators
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

				// Send the message to the application channel for approval and rejection
				await interaction.guild.channels.cache.get(ApplicationReviewChannelID).send({ content: `${userval._id}`, embeds: [profEmbed, userInfo], components: [rows] });

				// Update the status message and remove the buttons
				await interaction.update({ embeds: [embed], ephemeral: true, components: [] });
			}

			// If moderators approved the profile
			if (interaction.customId == 'approveProfile') {
				// Get the necessary informations
				const userProfile = await Application.findOne({ _id: interaction.message.content });
				const guildMember = await interaction.guild.members.fetch(userProfile.userID);

				// Update the database
				userProfile.Status = 'approved';
				userProfile.save();

				// Add the VTuber Roles
				await guildMember.roles.add(VTuberRoleID, `VTuber Application approved by ${interaction.user.tag}`);

				// Create an embed for the user
				const reEmbed = new EmbedBuilder()
					.setColor('Green')
					.setTitle('Your profile has been approved!')
					.setDescription('You have now unlocked vtuber specific channels and role commands! Explore them!')
					.setTimestamp();

				// Try to send a DM to the user, if failed then do nothing
				try {
					guildMember.send({ embeds: [reEmbed] });
				}
				catch (err) {
					await interaction.channel.send({ content: 'The bot cannot reach the user. Their DMs might be closed.' });
				}

				// eslint-disable-next-line no-unused-vars
				const funButton = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('funbuttondoesabsolutelynothing')
							.setLabel(`Profile approved by ${interaction.user.tag}!`)
							.setStyle(ButtonStyle.Success),
					);

				// Update the message to remove their database profile id from content and update the component
				await interaction.update({ content: '', components: [funButton] });
			}

			if (interaction.customId == 'denyProfile') {
				// Create a new modal
				const modal = new ModalBuilder()
					.setCustomId('reasonModal')
					.setTitle('Enter a reason');

				// The input
				const responseModal = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel('This will be sent to the user.')
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true);

				// The Row
				const firstActionRow = new ActionRowBuilder().addComponents(responseModal);

				// Add the row to the modal
				modal.addComponents(firstActionRow);

				// Show the modal
				await interaction.showModal(modal);
			}
		}

		// The modal submission collection
		if (interaction.isModalSubmit()) {
			if (interaction.customId == 'reasonModal') {
				// Defer the reply
				await interaction.deferUpdate();

				// Get the necessary information
				const userProfile = await Application.findOne({ _id: interaction.message.content });
				const reason = interaction.fields.getTextInputValue('reasonInput');
				const guildMember = await interaction.guild.members.fetch(userProfile.userID);

				// Update the database
				userProfile.Status = 'Not Applied';
				userProfile.save();

				// Remove the VTuber Roles
				await guildMember.roles.remove(VTuberRoleID, `VTuber Profile rejected by ${interaction.user.tag}`);

				// Create an embed for the user to see
				const reEmbed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('Your profile was rejected.')
					.setDescription(`${reason}`)
					.setTimestamp();

				// Send the guild member the DM
				try {
					guildMember.send({ embeds: [reEmbed] });
				}
				catch (err) {
					await interaction.channel.send({ content: 'The bot cannot reach the user. Their DMs might be closed.' });
				}

				const funButton = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('funbuttondoesabsolutelynothing')
							.setLabel(`Profile rejected by ${interaction.user.tag}!`)
							.setStyle(ButtonStyle.Danger),
					);

				// Update the message to remove their database profile id from content and update the component
				await interaction.editReply({ content: `**Reason:** ${reason}`, components: [funButton] });
			}

			if (interaction.customId == 'revokeModal') {
				// Parse the inputs
				const reason = interaction.fields.getTextInputValue('reasonInput');
				const userIDi = interaction.fields.getTextInputValue('userIDinput');

				// Get the necessary information
				const userProfile = await Application.findOne({ userID: userIDi });
				const guildMember = await interaction.guild.members.fetch(userIDi);

				// Validate that the profile exists
				if (!userProfile) {
					return interaction.reply({ content: 'The profile does not exist', ephemeral:true });
				}

				// Validate that the profile is approved
				if (userProfile.Status != 'approved') {
					return interaction.reply({ content: 'The user does not have an approved profile!', ephemeral: true });
				}

				// Update the database
				userProfile.Status = 'Not Applied';
				userProfile.save();

				// Remove the VTuber Roles
				await guildMember.roles.remove(VTuberRoleID, `VTuber Profile revoked by ${interaction.user.tag} for ${reason}`);

				// Create an embed for the user to see
				const reEmbed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('Your profile was revoked.')
					.setDescription(`${reason}`)
					.setTimestamp();

				// Send the guild member the DM
				try {
					guildMember.send({ embeds: [reEmbed] });
				}
				catch (err) {
					await interaction.user.send({ content: 'The bot cannot reach the user. Their DMs might be closed.' });
				}

				// Give confirmation to the mod
				await interaction.reply({ content: 'Profile revoked successfully', ephemeral: true });
			}
		}

		// If interaction is a context menu
		if (interaction.isUserContextMenuCommand()) {
			if (interaction.commandName == 'Revoke Application') {
				// Check if user has permission
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
					return interaction.reply({ content: 'You do not have permission to modify this profile.', ephemeral: true });
				}

				// Get the necessary information
				const targetUser = interaction.targetUser;
				const userProfile = await Application.findOne({ userID: targetUser.id });

				// Validate that the profile exists
				if (!userProfile) {
					return interaction.reply({ content: 'The profile does not exist', ephemeral:true });
				}

				// Validate that the profile is approved
				if (userProfile.Status != 'approved') {
					return interaction.reply({ content: 'The user does not have an approved profile!', ephemeral: true });
				}

				// Ask for the reason (required)
				// Create a new modal
				const modal = new ModalBuilder()
					.setCustomId('revokeModal')
					.setTitle(`Revoking ${targetUser.username}'s VTuber Profile`);

				// The input
				const responseModal = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel('Revoke Reason')
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(true);

				const userIDsave = new TextInputBuilder()
					.setCustomId('userIDinput')
					.setLabel('DO NOT CHANGE')
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
					.setValue(`${targetUser.id}`);

				// The Row
				const firstActionRow = new ActionRowBuilder().addComponents(responseModal);
				const secondActionRow = new ActionRowBuilder().addComponents(userIDsave);

				// Add the row to the modal
				modal.addComponents(firstActionRow, secondActionRow);

				// Show the modal
				return await interaction.showModal(modal);
			}
		}
	},
};