const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Roundtrip Latency and WS heartbeat!')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether to hide the reply or not {By Default True}')),
	async execute(interaction) {
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

		const sent = await interaction.deferReply({ fetchReply: true, ephemeral: ephemeral });
		const wsheartbeat = interaction.client.ws.ping;

		const pingEmbed = new EmbedBuilder()
			.setColor(0xE0115F)
			.setTitle('Pong! 🏓')
			.setDescription('Your message was received! (Click the numbers to see what they mean)')
			.addFields(
				{ name: 'Roundtrip Latency ⌚', value: `[${sent.createdTimestamp - interaction.createdTimestamp}ms](https://www.cloudflare.com/learning/cdn/glossary/round-trip-time-rtt/)`, inline: true },
				{ name: 'Websocket Heartbeat Latency 💓', value: `[${wsheartbeat}ms](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#pings_and_pongs_the_heartbeat_of_websockets)`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: `Requested by: ${interaction.member.user.username}#${interaction.member.user.discriminator}`, iconURL: `${interaction.member.user.avatarURL()}` });

		await interaction.editReply({ embeds: [pingEmbed] });
	},
};
