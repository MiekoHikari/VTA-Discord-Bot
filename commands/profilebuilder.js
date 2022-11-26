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

			return await interaction.reply({ embeds: [noProfileEmbed], components: [noProfileRow], ephemeral: true });
		}

		if (userProfile.Status == 'pending' || userProfile.Status == 'approved') {
			const profEmbed = new EmbedBuilder()
				.setTitle('VTA Profile Locked 🔒')
				.setColor('Red')
				.setDescription('Your VTA Profile is either pending or already approved. Use the apply command to revert.');

			return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
		}

		if (interaction.options.getSubcommand() === 'avatar') {
			const avatarpng = interaction.options.getAttachment('avatarpng');

			if (!avatarpng.contentType.startsWith('image')) {
				const failEmbed = new EmbedBuilder()
					.setColor(0xE0115F)
					.setTitle('Failed to read image from discord')
					.setDescription('Image validation failed. Please upload an image! Commonly supported formats are JPEG and PNG.');

				return await interaction.reply({ embeds: [failEmbed], ephemeral: true });
			}

			userProfile.AvatarIcon = avatarpng.url;
			userProfile.save();

			const sucEmbed = new EmbedBuilder()
				.setColor(0x50C878)
				.setTitle('Success!')
				.setDescription('Your image was successfully saved into the database.');

			await interaction.reply({ embeds:[sucEmbed], ephemeral:true });
		}

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
