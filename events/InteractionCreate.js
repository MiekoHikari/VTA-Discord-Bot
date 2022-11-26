const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.customId == 'doingthecat') {
			const lEmbed = new EmbedBuilder()
				.setTitle(`${interaction.user.tag} JUST TRIED TO DO THE CAT, SHAME ON HIM!`)
				.setColor('DarkRed')
				.setDescription('You tried to approach the cat but everyone also wants to do the cat! The cat is now watching your movements. Better stay frozen.');

			interaction.reply({ embeds: [lEmbed] });
		}
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};
