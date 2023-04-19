const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Application = require('../Database/Schemas/application');
const Levels = require('discord-xp');
const dayjs = require('dayjs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('application')
		.setDescription('The protocol for application management')
		.addSubcommand(subcommand =>
			subcommand
				.setName('enroll')
				.setDescription('Enroll into the VTA\'s VTuber Database'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Suspend / Delete your VTuber Application')),
	async execute(interaction) {
		// Look for user profile
		const userProfile = await Application.findOne({ userID: interaction.user.id });

		// If the user doesn't have a profile then let's ask them if they want to create one!
		if (!userProfile) {
			const noProfileRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('create')
						.setLabel('Of Course!')
						.setStyle(ButtonStyle.Success),
				);

			const noProfileEmbed = new EmbedBuilder()
				.setColor(0xE0115F)
				.setTitle('We\'re glad you\'re interested!')
				.setDescription('You\'re just **1 step away** from being a VTA Candidate! We just want to confirm, *do you really want to apply?*')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return await interaction.reply({ embeds: [noProfileEmbed], components: [noProfileRow], ephemeral: true });
		}

		// Check if the user's profile is pending approval
		if (userProfile.Status === 'pending') {
			const pendingEmbed = new EmbedBuilder()
				.setColor('Red')
				.setTitle('Your profile is locked 🔒')
				.setDescription('Your Application is currently locked from any further modification. Please wait until you\'ve been approved or rejected.')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return interaction.reply({ embeds: pendingEmbed, ephemeral: true });
		}

		// Check if the user is marked "inactive"
		if (userProfile.Status === 'Inactive') {
			const pendingEmbed = new EmbedBuilder()
				.setColor('Yellow')
				.setTitle('Don\'t worry, you\'ll receive your roles soon!')
				.setDescription('We automatically remove VTubers who are inactive for over 5 days but they regain their roles back if they interact again! The bot checks for activity every 5 minutes to reduce the load on the database.')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return interaction.reply({ embeds: pendingEmbed, ephemeral: true });
		}

		// Check if user run the /application enroll command
		if (interaction.options.getSubcommand() === 'enroll') {
			// If the user does have a profile in the database but is approved, tell them they can't apply unless they revert their profile
			if (userProfile.Status == 'approved') {
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

				return await interaction.reply({ embeds: [validEmbed], ephemeral: true, components: [createRow] });
			}

			// Validation Constructors / Messages
			const yes = '**✅ Yes**';
			const no = '**❌ No**';
			const JoinDate = await dayjs(interaction.member.joinedTimestamp);
			const NowDate = dayjs(Date.now());
			const userLevel = await Levels.fetch(interaction.user.id, interaction.guildId);

			// Initial Application Requirements Booleans
			let isAvatar = no;
			let isName = no;
			let isDesc = no;
			let isPlat = no;
			let isActive = no;
			let isMember = no;
			let canSubmit = false;

			// Validate the applications
			if (userProfile.AvatarIcon != 'None') { isAvatar = yes; }
			if (userProfile.VTuberName != 'None') { isName = yes; }
			if (userProfile.Description != 'None') { isDesc = yes; }
			if (userProfile.YouTube != 'None' || userProfile.Twitch != 'None') { isPlat = yes; }

			// Validate user activity
			if (userLevel.level >= 3) {
				isActive = yes;
			}

			// Validate Member join Duration
			if (NowDate.diff(JoinDate, 'day') >= 14) {
				isMember = yes;
			}

			// Validate if the members meet all the requirements
			if (isAvatar == yes && isName == yes && isDesc == yes && isPlat == yes && isActive == yes && isMember == yes) { canSubmit = true; }

			// Create a row of buttons
			const createRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('profilebuilder')
						.setLabel('Edit Profile 🎨')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('Submit')
						.setLabel('Submit! ☑️')
						.setStyle(ButtonStyle.Success)
						.setDisabled(!canSubmit),
				);

			// Create a embed
			const validEmbed = new EmbedBuilder()
				.setColor(0xE0115F)
				.setTitle('Candidate Requirements')
				.setDescription('Before Submission all candidates must fill in the following submission and meet certain requirements:')
				.addFields(
					{ name: 'Name Saved?', value: `${isName}`, inline: true },
					{ name: 'Photo Saved?', value: `${isAvatar}`, inline: true },
					{ name: 'Description Saved?', value: `${isDesc}`, inline: true },
					{ name: 'Streaming Platform Saved?', value: `${isPlat}`, inline: true },
					{ name: 'Server Activity Level 3?', value: `${isActive}`, inline: true },
					{ name: 'Server Membership 14 days?', value: `${isMember}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			// Respond to the interaction
			return await interaction.reply({ embeds: [validEmbed], components: [createRow], ephemeral: true });
		}

		if (interaction.options.getSubcommand() === 'delete') {
			if (userProfile.Status == 'approved') {
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

				return await interaction.reply({ embeds: [validEmbed], ephemeral: true, components: [createRow] });
			}

			await userProfile.remove();

			const removeEmbed = new EmbedBuilder()
				.setColor('DarkVividPink')
				.setTitle('Your profile has been deleted! ✅')
				.setDescription('Your profile has successfully been deleted!')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return interaction.reply({ embeds: [removeEmbed], ephemeral: true });
		}
	},
};
