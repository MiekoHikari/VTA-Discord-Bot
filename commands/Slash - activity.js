const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
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
						.setDescription('Whether to hide the reply or not {By Default True}')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('modify')
				.setDescription('Modify someone\'s level')
				.addUserOption(option => option.setName('mod-target').setDescription('The user to modify').setRequired(true))
				.addStringOption(option =>
					option.setName('mod-type')
						.setDescription('Modification Type')
						.setRequired(true)
						.addChoices(
							{ name: 'Add Level', value: 'add' },
							{ name: 'Subtract Level', value: 'subtract' },
						))
				.addIntegerOption(option =>
					option.setName('level-amount')
						.setDescription('Amount of level to add and subtract from the user')
						.setRequired(true))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'check') {
			// Parse the command
			const userMention = await interaction.options.getUser('check-target');
			const target = await Levels.fetch(userMention.id, interaction.guildId);
			const ephemeralOption = await interaction.options.getBoolean('ephemeral') ?? true;

			// Validate the command
			if (!target) {
				const failEmbed = new EmbedBuilder()
					.setColor('Gold')
					.setTitle('Error fetching activity ⚠️')
					.setDescription('The user you mentioned has no activity on this server!!!')
					.setTimestamp()
					.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

				return interaction.reply({ embeds: [failEmbed], ephemeral: true });
			}

			// Constuct the embed
			const Lembed = new EmbedBuilder()
				.setColor('Random')
				.setTitle(`${userMention.username}`)
				.addFields({ name: 'Level', value: `${target.level}`, inline: true })
				.addFields({ name: 'XP', value: `${target.xp}**/**${Levels.xpFor(target.level + 1)}`, inline: true })
				.setThumbnail(userMention.avatarURL())
				.setTimestamp()
				.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

			// Return a reply
			return await interaction.reply({ embeds: [Lembed], ephemeral: ephemeralOption });
		}

		if (interaction.options.getSubcommand() === 'modify') {
			// Validate the interaction user has permission to modify the profile.
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
				return interaction.reply({ content: 'You do not have permission to modify this profile.', ephemeral: true });
			}

			// Parse the command
			const user = await interaction.options.getUser('mod-target');
			const type = await interaction.options.getString('mod-type');
			const amount = await interaction.options.getInteger('level-amount');

			// Setup embed
			// eslint-disable-next-line prefer-const
			let embed = new EmbedBuilder()
				.setColor('DarkGold')
				.setTitle(`${type} ${user.tag}: ${amount} levels`);

			// Add or Subtract levels?
			if (type == 'add') {
				await Levels.appendLevel(user.id, interaction.guildId, amount);
				embed.setDescription('Levels successfully added.');

				return await interaction.reply({ ephemeral: true, embeds: [embed] });
			}
			else if (type == 'subtract') {
				await Levels.subtractLevel(user.id, interaction.guildId, amount);
				embed.setDescription('Levels successfully removed.');

				return await interaction.reply({ ephemeral: true, embeds: [embed] });
			}
		}
	},
};
