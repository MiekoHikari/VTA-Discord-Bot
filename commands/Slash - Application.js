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
		.addSubcommandGroup(subcommandgroup =>
			subcommandgroup
				.setName('builder')
				.setDescription('VTA\'s very own app building system for their candidates!')
				.addSubcommand(subcommand =>
					subcommand
						.setName('pb-menu')
						.setDescription('Bring up the app builder menu'))
				.addSubcommand(subcommand =>
					subcommand
						.setName('pb-avatar')
						.setDescription('Upload your VTuber Avatar!')
						.addAttachmentOption(option =>
							option
								.setName('avatarpng')
								.setDescription('Upload your VTuber Avatar!')
								.setRequired(true),
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('delete')
				.setDescription('Suspend / Delete your VTuber Application')),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral:true });
		const userProfile = await Application.findOne({ userID: interaction.user.id });

		if (!userProfile) {
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

		if (userProfile.Status === 'pending') {
			const pendingEmbed = new EmbedBuilder()
				.setColor('Red')
				.setTitle('Your profile is locked 🔒')
				.setDescription('Your Application is currently locked from any further modification. Please wait till you\'re approved or rejected.')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return interaction.editReply({ embeds: pendingEmbed, ephemeral: true });
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

				return await interaction.editReply({ embeds: [validEmbed], ephemeral: true, components: [createRow] });
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
			if (userProfile.AvatarIcon != 'None') { isAvatar = yes; }
			if (userProfile.VTuberName != 'None') { isName = yes; }
			if (userProfile.Description != 'None') { isDesc = yes; }
			if (userProfile.YouTube != 'None' || userProfile.Twitch != 'None') { isPlat = yes; }

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
		}

		if (interaction.options.getSubcommand() === 'pb-menu') {

			const meEmbed = new EmbedBuilder()
				.setColor(0x50C878)
				.setTitle('Welcome to the profile builder!')
				.setDescription('The profile builder is a tool developed for the VTA candidates that are applying for the VTuber Role. If you want to get started, click the `Launch ProfileBuilder` Button!');

			const row = new ActionRowBuilder()
				.addComponents(new ButtonBuilder().setCustomId('profilebuilder').setLabel('Launch Profile Builder 🚀').setStyle(ButtonStyle.Primary));

			await interaction.editReply({ embeds: [meEmbed], components: [row], ephemeral: true });
		}

		if (interaction.options.getSubcommand() === 'avatar') {
			const avatarpng = interaction.options.getAttachment('avatarpng');

			// Validate the image (if discord regonizes that this is an image)
			if (!avatarpng.contentType.startsWith('image')) {
				const failEmbed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('Failed to read image from discord')
					.setDescription('Image validation failed. Please upload an image! Commonly supported formats are JPEG and PNG.');

				return await interaction.reply({ embeds: [failEmbed], ephemeral: true });
			}

			// Save the avatar in the database for later use
			userProfile.AvatarIcon = avatarpng.url;
			userProfile.save();

			const sucEmbed = new EmbedBuilder()
				.setColor(0x50C878)
				.setTitle('Success!')
				.setDescription('Your image was successfully saved into the database.');

			// Let the user know that the data is saved.
			await interaction.reply({ embeds:[sucEmbed], ephemeral:true });
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

				return await interaction.editReply({ embeds: [validEmbed], ephemeral: true, components: [createRow] });
			}

			await userProfile.remove();

			const removeEmbed = new EmbedBuilder()
				.setColor('DarkVividPink')
				.setTitle('Your profile has been deleted! ✅')
				.setDescription('Your profile has successfully been deleted!')
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			return interaction.editReply({ embeds: [removeEmbed], ephemeral: true });
		}
	},
};
