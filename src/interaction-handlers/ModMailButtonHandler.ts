import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { EmbedBuilder, type ButtonInteraction, type ForumChannel, AttachmentBuilder, GuildMember } from 'discord.js';
import modProfile from '../assets/db.models/ModerationProfile';
import { Timestamp } from '@sapphire/time-utilities';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		if (interaction.customId === 'modmail-confirm') {
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

		if (interaction.customId === 'modmail-report') {
			let userDB = await modProfile.findOne({ DiscordID: interaction.user.id });
			if (userDB?.ModMail?.ThreadID) return interaction.message.edit('Bruh you already have a modmail channel opened. Ask staff to close that one first!');

			if (userDB === null) {
				userDB = new modProfile({
					DiscordID: `${interaction.user.id}`,
					Strikes: []
				});

				await userDB.save();
			}

			let history: Array<string> = [];
			userDB?.Strikes?.forEach((strike) => {
				history.reverse().push(`[${strike.ViolationType}] [${strike.Date}] [${strike.messageURL}]`);
			});

			let reportedDB = await modProfile.findOne({ DiscordID: interaction.user.id });

			if (reportedDB === null) {
				reportedDB = new modProfile({
					DiscordID: `${interaction.user.id}`,
					Strikes: []
				});

				await reportedDB.save();
			}

			let rhistory: Array<string> = [];
			reportedDB?.Strikes?.forEach((strike) => {
				history.reverse().push(`[${strike.ViolationType}] [${strike.Date}] [${strike.messageURL}]`);
			});

			const memberEmbed = new EmbedBuilder()
				.setColor('Random')
				.setTitle(`${interaction.user.username}'s Mod Profile`)
				.setDescription(`This is the reporter. Not the reported.`)
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
				reason: `${interaction.user.username} reported a member`
			});
			
			await interaction.reply({ content: 'Thread created! Check your DMs', embeds: [], components: [] });

			let MsgArray: any[] = [];
			const reportedUser = await interaction.guild?.members.fetch(`${userDB.ModMail?.Target?.id}`) as GuildMember;

			const reportEmbed = new EmbedBuilder()
				.setColor('Random')
				.setTitle(`${reportedUser.user.username} has been reported`)
				.setDescription(`This is the reported. Have a chat with the reporter to see whats wrong.`)
				.setThumbnail(`${reportedUser.user.avatarURL()}`)
				.addFields(
					{ name: 'User ID', value: `${userDB.ModMail?.Target?.id}`, inline: true },
					{ name: 'Strike History', value: `**${rhistory.join('\n')}**`, inline: false }
				)
				.setTimestamp();

			let messageLogs: Array<string> = [];

			const timestamp = new Timestamp('DD-MM-YYYY HH:mm');
			await interaction.channel?.messages.fetch({ limit: 26 }).then((messages) => {
				messages.forEach(async (message) => {
					let attachments: Array<string> = [];
					await message.attachments.forEach((attachment) => {
						attachments.push(attachment.url);
					});

					messageLogs?.push(
						`\n[${timestamp.displayUTC(message.createdTimestamp)}] [${message.author.username}]\n${message.content}\n${attachments}`
					);
				});
			});

			const log: string = messageLogs.reverse().join('\n');
			const attachment = new AttachmentBuilder(Buffer.from(log), { name: 'logs.txt' });

			webhook
				?.send({
					avatarURL: `${interaction.user.avatarURL()}`,
					username: `${interaction.user.username}`,
					threadId: ModMailThread.id,
					content: `<@${userDB.ModMail?.Target?.id}> has been reported!`,
					embeds: [reportEmbed],
					files: [attachment]
				})
				.then((msg) => {
					if (userDB === null) return;

					let msgAttachments: string[] = [];
					msg.attachments.forEach((attachment) => {
						msgAttachments.push(`${attachment.url}`);
					});

					MsgArray.push({
						ts: `${new Date().toUTCString()}`,
						username: interaction.user.username,
						content: msg.content,
						attachments: msgAttachments
					});

					userDB.ModMail = {
						ThreadID: msg.channel.id,
						Messages: MsgArray
					};

					userDB?.save();
				});
		}

		return;
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('modmail-')) return this.none();

		return this.some();
	}
}
