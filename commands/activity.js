const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Levels = require('discord-xp');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('activity')
		.setDescription('Track your server activity with the activity protocol!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('check')
				.setDescription('Check your/someone\'s server activity')
				.addUserOption(option => option.setName('check-target').setDescription('The user to check').setRequired(true))
				.addBooleanOption(option =>
					option.setName('ephemeral')
						.setDescription('Whether to hide the reply or not {By Default True}'))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'check') {
			const userMention = await interaction.options.getUser('check-target');
			const target = await Levels.fetch(userMention.id, interaction.guildId);

			if (!target) {
				const failEmbed = new EmbedBuilder()
					.setColor('Gold')
					.setTitle('Error fetching activity ⚠️')
					.setDescription('The user you mentioned has no activity on this server!!!')
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

				return interaction.reply({ embeds: [failEmbed], ephemeral: true });
			}

			const Lembed = new EmbedBuilder()
				.setColor('Random')
				.setTitle(`${userMention.username}`)
				.addFields({ name: 'Level', value: `${target.level}`, inline: true })
				.addFields({ name: 'XP', value: `${target.xp}**/**${Levels.xpFor(target.level + 1)}`, inline: true })
				.setThumbnail(userMention.avatarURL())
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			let ephemeralOption = true;
			if (interaction.options.getBoolean('ephemeral') == null) {
				ephemeralOption = true;
			}
			else if (interaction.options.getBoolean('ephemeral') == false) {
				ephemeralOption = false;
			}

			await interaction.reply({ embeds: [Lembed], ephemeral: ephemeralOption });
		}
	},
};
