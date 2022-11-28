const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Application = require('../Database/Schemas/application');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Look for a user\'s VTuber Profile!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('Who\'s profile do you want to see?')
				.setRequired(true),
		)
		.addBooleanOption(option =>
			option
				.setName('ephemeral')
				.setDescription('Post the profile privately or publicly.')),
	async execute(interaction) {
		// get necessary information
		const comUser = interaction.options.getUser('user');
		const userProfile = await Application.findOne({ userID: comUser.id });
		let ephemeralOption = await interaction.options.getBoolean('ephemeral') ?? true;

		// Validate if user is in our database
		if (!userProfile) {
			const profEmbed = new EmbedBuilder()
				.setTitle('Profile not found! ⚠️')
				.setColor('Red')
				.setDescription('We could not find the profile for the user you are looking for.');

			return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
		}

		// Validate if user is applied
		if (userProfile.Status == 'Not Applied') {
			const profEmbed = new EmbedBuilder()
				.setTitle('Profile not applied! ⚠️')
				.setColor('Red')
				.setDescription('The profile you\'re looking for has not applied to be a vtuber yet.');

			return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
		}

		// If the user is pending an application and the interaction user is the owner of the profile
		if (userProfile.Status == 'pending') {
			if (!interaction.user.id == userProfile.userID) {
				const profEmbed = new EmbedBuilder()
					.setTitle('Profile not applied! ⚠️')
					.setColor('Red')
					.setDescription('For the safety of members, pending profile results must be ephemeral and only visible to the profile owner.');

				return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
			}
			else {
				ephemeralOption = true;
			}
		}

		// Foundation Embed
		// eslint-disable-next-line prefer-const
		let profEmbed = new EmbedBuilder()
			.setColor(0xE0115F)
			.setTitle(`${userProfile.VTuberName}`)
			.setDescription(`${userProfile.Description}`)
			.setAuthor({ name: `${comUser.username}#${comUser.discriminator}`, iconURL: `${comUser.avatarURL()}` })
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

		// Construct the user profile based on the information we have collected
		if (!(userProfile.YouTube == 'None')) {
			profEmbed.addFields({ name: 'YouTube Channel', value: `${userProfile.YouTube}`, inline: true });
		}

		if (!(userProfile.Twitch == 'None')) {
			profEmbed.addFields({ name: 'Twitch Channel', value: `${userProfile.Twitch}`, inline: true });
		}

		if (!(userProfile.Twitter == 'None')) {
			profEmbed.addFields({ name: 'Twitter', value: `${userProfile.Twitter}`, inline: true });
		}

		if (!(userProfile.TikTok == 'None')) {
			profEmbed.addFields({ name: 'TikTok', value: `${userProfile.TikTok}`, inline: true });
		}

		profEmbed.setImage(`${userProfile.AvatarIcon}`);

		// Send the reply
		await interaction.reply({ embeds: [profEmbed], ephemeral: ephemeralOption });
	},
};
