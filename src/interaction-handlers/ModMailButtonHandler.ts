import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, type ButtonInteraction, type ForumChannel } from 'discord.js';
import modProfile from '../assets/db.models/ModerationProfile';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		if (interaction.customId === 'modmail-confirm') {
			const guildMember = await interaction.guild?.members.fetch(interaction.user.id);
			let user = await modProfile.findOne({ DiscordID: interaction.user.id });

			if (user === null) {
				user = new modProfile({
					DiscordID: `${interaction.user.id}`,
					Strikes: []
				});

				await user.save();
			}

			let history: Array<string> = [];
			user?.Strikes?.forEach((strike) => {
				history.reverse().push(`[${strike.ViolationType}] [${strike.Date}] [${strike.messageURL}]`);
			});

			console.log(guildMember);

			const memberEmbed = new EmbedBuilder()
				.setColor('Random')
				.setTitle(`${interaction.user.username}'s Mod Profile`)
				.setDescription(`Important information you may need to know before serving this member`)
				.setThumbnail(`${interaction.user.avatarURL()}`)
				.addFields(
					{ name: 'User ID', value: `${interaction.user.id}`, inline: true },
					{ name: 'Strike History', value: `**${history.join('\n')}**`, inline: false }
				)
				.setTimestamp();

			const DiscordServer = await interaction.client.guilds.fetch(`${process.env.ServerID}`);
			const ModMailChannel = (await DiscordServer.channels.fetch(`${process.env.ModMailChannel}`)) as ForumChannel;
			const webhooks = await ModMailChannel.fetchWebhooks();
			const webhook = webhooks.first();

			const ModMailThread = await ModMailChannel.threads.create({
				name: `${interaction.user.username}`,
				message: {
					content: `I summon all <@&${process.env.ModRole}> to respond to the new thread by <@${interaction.user.id}>!`,
					embeds: [memberEmbed]
				},
				reason: `VTA ModMail Create`
			});

			const message = (await interaction.channel?.messages.fetch(`${interaction.message.content}`)) ?? interaction.message;
			let MsgArray: any[] = [];

			const attachments: any[] = [];
			message.attachments.forEach((attachment) => {
				attachments.push({
					attachment: attachment.url,
					name: attachment.name
				});
			});

			webhook
				?.send({
					avatarURL: `${message.author.avatarURL()}`,
					username: `${message.author.username}`,
					threadId: ModMailThread.id,
					content: message.content,
					files: attachments
				})
				.then((msg) => {
					if (user === null) return;

					let msgAttachments: string[] = [];
					msg.attachments.forEach((attachment) => {
						msgAttachments.push(`${attachment.url}`);
					});
					MsgArray.push({
						ts: `${new Date().toUTCString()}`,
						username: interaction.user.username,
						content: message.content,
						attachments: msgAttachments
					});

					user.ModMail = {
						ThreadID: ModMailThread.id,
						Messages: MsgArray
					};

					user?.save();
				});

			const embed = new EmbedBuilder()
				.setTitle('Thread successfully created!')
				.setDescription('ModMail logs are available at the end of the thread.')
				.setTimestamp();

			interaction.message.edit({ content: 'ModMail Thread Created!', embeds: [embed], components: [] });
		}

		return;
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('modmail-')) return this.none();

		return this.some();
	}
}
