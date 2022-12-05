const Dayjs = require('dayjs');
const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const cooldown = new Set();
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		if (interaction.isMessageContextMenuCommand()) {
			if (interaction.commandName == 'Report Message') {
				if (cooldown.has(interaction.user.id)) {
					return interaction.reply({ content: 'It seems that you have recently sent us an report, please try again later', ephemeral: true });
				}

				const TargetMessage = await interaction.targetMessage;

				const reasonModal = new ModalBuilder()
					.setCustomId('reportReason')
					.setTitle('Report Message');

				const reasonInput = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel('Why are you reporting this message?')
					.setStyle(TextInputStyle.Paragraph);

				const targetMessageID = new TextInputBuilder()
					.setCustomId('messageID')
					.setLabel('Message ID (Do not change)')
					.setStyle(TextInputStyle.Short)
					.setValue(`${TargetMessage.id}`);

				const targetChannelID = new TextInputBuilder()
					.setCustomId('channelID')
					.setLabel('Channel ID (Do not change)')
					.setStyle(TextInputStyle.Short)
					.setValue(`${TargetMessage.channelId}`);

				const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
				const secondActionRow = new ActionRowBuilder().addComponents(targetMessageID);
				const thirdActionRow = new ActionRowBuilder().addComponents(targetChannelID);

				reasonModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

				await interaction.showModal(reasonModal);
			}
		}

		if (interaction.isModalSubmit) {
			if (interaction.customId === 'reportReason') {
				const reason = await interaction.fields.getTextInputValue('reasonInput');
				const messageID = await interaction.fields.getTextInputValue('messageID');
				const channelID = await interaction.fields.getTextInputValue('channelID');
				const message = await interaction.channel.messages.fetch(messageID);
				const reUser = await interaction.guild.members.fetch(message.author.id);

				const aEmbed = new EmbedBuilder()
					.setColor('Red')
					.setTitle('Discord Trust and Safety Information')
					.setDescription('Information Discord Trust and Safety team might ask about when reporting at https://dis.gd/request')
					.addFields(
						{ name: 'Message ID', value: `${messageID}`, inline: true },
						{ name: 'Channel ID', value: `${channelID}`, inline: true },
						{ name: 'Guild ID', value: `${interaction.guildId}`, inline: true },
					);

				const bEmbed = new EmbedBuilder()
					.setColor('Yellow')
					.setTitle('Report Details')
					.setDescription('Information the staff may need to give a verdict.')
					.addFields(
						{ name: 'Report Reason', value: `${reason}`, inline: false },
						{ name: 'Reporter', value: `${interaction.user.tag}`, inline: true },
					)
					.setTimestamp();

				const cEmbed = new EmbedBuilder()
					.setColor('Green')
					.setTitle('Reported Message Details')
					.setDescription('Details about the reported message and user')
					.addFields(
						{ name: 'Reported Message Content', value: ` ${message.content} `, inline: false },
						{ name: 'Reported Channel', value: `<#${message.channelId}>`, inline: true },
						{ name: 'Message Creation Date', value: `${Dayjs(message.createdTImestamp)}`, inline: true },
						{ name: 'Message URL', value: `${message.url}`, inline: false },
						{ name: ' - - - - - - - - - - - - - - - - - - - -', value: '** **', inline: false },
						{ name: 'Reported User', value: `${message.author.tag}`, inline: true },
						{ name: 'User ID', value: `${message.author.id}`, inline: true },
						{ name: 'User Creation Date:', value: `${Dayjs(reUser.user.createdTimestamp)}`, inline: true },
						{ name: 'Server Join Date:', value: `${Dayjs(reUser.joinedTimestamp)}`, inline: true },
					);

				const reportChannel = await interaction.guild.channels.fetch(process.env.REPORTSCHANNEL);
				reportChannel.send({ embeds: [aEmbed, bEmbed, cEmbed] });

				cooldown.add(interaction.user.id);
				setTimeout(() => {
					cooldown.delete(interaction.user.id);
				}, 600000);

				return await interaction.reply({ content: 'A staff will review your report soon.', ephemeral: true });
			}
		}

	},
};