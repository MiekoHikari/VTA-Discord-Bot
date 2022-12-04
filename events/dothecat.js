const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		if (interaction.customId == 'doingthecat') {
			const lEmbed = new EmbedBuilder()
				.setTitle(`${interaction.user.tag} JUST TRIED TO DO THE CAT, SHAME ON HIM!`)
				.setColor('DarkRed')
				.setDescription('You tried to approach the cat but everyone also wants to do the cat! The cat is now watching your movements. Better stay frozen.');

			interaction.reply({ embeds: [lEmbed] });
		}
	},
};
