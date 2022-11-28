const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const Application = require('../Database/Schemas/application');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profilebuilder')
		.setDescription('The VTA Profile Building System!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('menu')
				.setDescription('Bring up the profile builder menu'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('avatar')
				.setDescription('Upload your VTuber Avatar!')
				.addAttachmentOption(option =>
					option
						.setName('avatarpng')
						.setDescription('Upload your VTuber Avatar')
						.setRequired(true),
				)),
	async execute(interaction) {
		// Get the user profile
		const userProfile = await Application.findOne({ userID: interaction.user.id });

		// Validate the user profile
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

			// Create a new profile if user does not exist
			return await interaction.reply({ embeds: [noProfileEmbed], components: [noProfileRow], ephemeral: true });
		}

		// Check  if the user profile is locked
		if (userProfile.Status == 'pending' || userProfile.Status == 'approved') {
			const profEmbed = new EmbedBuilder()
				.setTitle('VTA Profile Locked 🔒')
				.setColor('Red')
				.setDescription('Your VTA Profile is either pending or already approved. Use the apply command to revert.');

			return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
		}

		// Check if the command is for uploading an avatar
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

		// Check if the command is for launching the profile builder.
		if (interaction.options.getSubcommand() === 'menu') {
			const meEmbed = new EmbedBuilder()
				.setColor(0x50C878)
				.setTitle('Welcome to the profile builder!')
				.setDescription('The profile builder is a tool developed for the VTA candidates that are applying for the VTuber Role. If you want to get started, click the `Launch ProfileBuilder` Button!');

			const row = new ActionRowBuilder()
				.addComponents(new ButtonBuilder().setCustomId('profilebuilder').setLabel('Launch Profile Builder 🚀').setStyle(ButtonStyle.Primary));

			await interaction.reply({ embeds: [meEmbed], components: [row], ephemeral: true });
		}
	},
};
