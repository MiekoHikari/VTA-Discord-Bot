const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Application = require('../Database/Schemas/application');
const Levels = require('discord-xp');
const dayjs = require('dayjs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('apply')
		.setDescription('Apply for the VTuber Role!'),
	async execute(interaction) {
		// Get the user's existing application
		// eslint-disable-next-line prefer-const
		let userval = await Application.findOne({ userID: interaction.user.id });

		// Defer the reply to let discord know that this process is going to take a while
		await interaction.deferReply({ ephemeral:true });

		// If the user does not have a profile in the database, ask to create a new profile
		if (!userval) {
			const noProfileRow = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('create')
						.setLabel('Create Profile!')
						.setStyle(ButtonStyle.Danger),
				);

			const noProfileEmbed = new EmbedBuilder()
				.setColor(0xE0115F)
				.setTitle('Create new profile?')
				.setDescription('We can\'t find an existing profile under your userID! Would you like to create a new profile?')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return await interaction.editReply({ embeds: [noProfileEmbed], components: [noProfileRow], ephemeral: true });
		}

		// If the user does have a profile in the database but is approved, tell them they can't apply unless they revert their profile
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

			return await interaction.editReply({ embeds: [validEmbed], ephemeral: true, components: [createRow] });
		}

		// If the user has a pending application, they can't edit profile
		if (userval.Status == 'pending') {
			const validEmbed = new EmbedBuilder()
				.setColor('Grey')
				.setTitle('Your profile is currently locked!')
				.setDescription('Your profile is currently a pending application, as a result you cannot apply yet.');

			return await interaction.editReply({ embeds: [validEmbed], ephemeral: true });
		}

		// Validation Constructors / Messages
		const yes = '**✅ Saved**';
		const no = '**❌ Pending**';
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
		if (userval.AvatarIcon != 'None') { isAvatar = yes; }
		if (userval.VTuberName != 'None') { isName = yes; }
		if (userval.Description != 'None') { isDesc = yes; }
		if (userval.YouTube != 'None' || userval.Twitch != 'None') { isPlat = yes; }

		// Validate user activity
		if (userLevel.level >= 10) {
			isActive = yes;
		}

		// Validate Member join Duration
		if (NowDate.diff(JoinDate, 'day') >= 3) {
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
			.setTitle('Application Requirements')
			.setDescription('You will need to enter the necessary information before you can apply! You can always edit your profile before submission!')
			.addFields(
				{ name: 'Name', value: `${isName}`, inline: true },
				{ name: 'Photo', value: `${isAvatar}`, inline: true },
				{ name: 'Description', value: `${isDesc}`, inline: true },
				{ name: 'Streaming Platform', value: `${isPlat}`, inline: true },
				{ name: 'Server Activity Level 10', value: `${isActive}`, inline: true },
				{ name: 'Server Membership 3 days', value: `${isMember}`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

		// Respond to the interaction
		return await interaction.editReply({ embeds: [validEmbed], components: [createRow], ephemeral: true });
	},
};
