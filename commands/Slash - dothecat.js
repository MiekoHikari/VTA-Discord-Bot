const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cooldown = new Set();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dothecat')
		.setDescription('Do the cat!'),
	async execute(interaction) {

		// Check if the user is currently in cooldown
		if (cooldown.has(interaction.user.id)) {
			const lEmbed = new EmbedBuilder()
				.setColor('Red')
				.setTitle('The cat is wary of you!')
				.setDescription('The cat\'s glaring at you with evil eyes, better to stay frozen.')
				.setTimestamp();

			return interaction.reply({ embeds: [lEmbed], ephemeral: true });
		}

		// Set up an embed
		const lEmbed = new EmbedBuilder()
			.setColor('Grey')
			.setTitle('Do you really want to do the cat? You are told to not the cat')
			.setDescription('The cat is currently sleeping 🐈‍⬛')
			.setTimestamp();

		// Setup a confirmation message
		const component = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('doingthecat')
				.setLabel('I\'m sure! I want to cat!')
				.setStyle(ButtonStyle.Danger),
		);

		// Add the user to a cooldown of 12 hours
		cooldown.add(interaction.user.id);
		setTimeout(() => {
			cooldown.delete(interaction.user.id);
		}, 43200000);

		// reply to the user.
		await interaction.reply({ embeds: [lEmbed], components: [component], ephemeral: true });
	},
};
