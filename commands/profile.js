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
		const comUser = interaction.options.getUser('user');
		const userProfile = await Application.findOne({ userID: comUser.id });

		if (!userProfile) {
			const profEmbed = new EmbedBuilder()
				.setTitle('Profile not found! ⚠️')
				.setColor('Red')
				.setDescription('We could not find the profile for the user you are looking for.');

			return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
		}

		if (userProfile.Status == 'Not Applied') {
			const profEmbed = new EmbedBuilder()
				.setTitle('Profile not applied! ⚠️')
				.setColor('Red')
				.setDescription('The profile you\'re looking for has not applied to be a vtuber yet.');

			return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
		}

		let ephemerals = true;
		if (userProfile.Status == 'pending') {
			if (interaction.user.id == userProfile.userID) {
				ephemerals = true;
			}
			else {
				const profEmbed = new EmbedBuilder()
					.setTitle('Profile not applied! ⚠️')
					.setColor('Red')
					.setDescription('For the safety of members, pending profile results must be ephemeral and only visible to the profile owner.');

				return await interaction.reply({ embeds: [profEmbed], ephemeral: true });
			}
		}
		else { ephemerals = interaction.options.getBoolean('ephemeral'); }

		// eslint-disable-next-line prefer-const
		let profEmbed = new EmbedBuilder()
			.setColor(0xE0115F)
			.setTitle(`${userProfile.VTuberName}`)
			.setDescription(`${userProfile.Description}`)
			.setAuthor({ name: `${comUser.username}#${comUser.discriminator}`, iconURL: `${comUser.avatarURL()}` })
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

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

		await interaction.reply({ embeds: [profEmbed], ephemeral: ephemerals });
	},
};
