import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	ForumChannel,
	Guild,
	Message,
	ThreadChannel
} from 'discord.js';
import modProfile from '../assets/db.models/ModerationProfile';

@ApplyOptions<Listener.Options>({
	name: 'ModMail',
	event: Events.MessageCreate
})
export class ModMailListener extends Listener {
	public async run(message: Message) {
		if (message.author.bot) return;

		if (message.channel.type === ChannelType.DM) {
			const user = await modProfile.findOne({ DiscordID: message.author.id });

			if (!user) {
				await modProfile.create({
					DiscordID: message.author.id
				});
			}

			if (user?.ModMail?.ThreadID) {
				return this.sendThread(message, user.ModMail.ThreadID, user);
			}

			const embed = new EmbedBuilder()
				.setTitle('Want to create a new ModMail thread?')
				.setDescription("We can't find an existing modmail thread under your username")
				.setColor('Random')
				.setTimestamp();

			const confirm = new ButtonBuilder().setCustomId('modmail-confirm').setLabel('Create Thread 🧵').setStyle(ButtonStyle.Secondary);

			const row: any = new ActionRowBuilder().addComponents(confirm);

			return message.channel.send({ embeds: [embed], components: [row] }).then((MSG) => {
				MSG.edit(`${message.id}`);
			});
		}

		if (message.channel.parentId === process.env.ModMailChannel) {
			if (message.content.startsWith('!')) return message.react('🤐');
			const user = await modProfile.findOne({ ['ModMail.ThreadID']: message.channel.id });
			if (user === null || user.ModMail === undefined) return message.reply('Failed to fetch DM User');

			const member = await message.guild?.members.fetch(user.DiscordID);

			if (message.content.startsWith('=close')) {
				const reason: string = message.content.slice(1).trim();

				const embed: EmbedBuilder = new EmbedBuilder()
					.setAuthor({ name: `${message.author.username}` })
					.setColor('Random')
					.setTitle('Thread Closed 🔒')
					.setDescription("Thank you for using VTA Mod-Mail! If you have any more questions in the future, don't hesitate to contact us!")
					.addFields({ name: 'Reason', value: `${reason}` })
					.setTimestamp()
					.setFooter({ text: `Thread ID: ${message.channel.id}` });

				const logs = user.ModMail.Messages;
				let sendableLog: string[] = []
				logs.forEach(log => {
					sendableLog.push(`[${log.ts}] [${log.username}] ${log.content}`);
					
					log.attachments?.forEach(attachment => {
						sendableLog.push(`[${log.ts}] [${log.username}] ${attachment}`);
					})
				})

				const attachment = new AttachmentBuilder(Buffer.from(sendableLog.join('\n')), { name: `${member?.user.username}-${message.channel.id}.txt` });

				member?.send({ embeds: [embed], files: [attachment] });
				message.channel.send({ embeds: [embed], files: [attachment] });

				user.ModMail = undefined;
				await user.save();

				const channel = message.channel as ThreadChannel;
				await channel.setLocked(true, `Thread ID ${message.channel.id} resolved.`);
				return channel.setArchived(true, `Thread ID ${message.channel.id} archived.`);
			}

			const attachments: any[] = [];
			message.attachments.forEach((attachment) => {
				attachments.push({
					attachment: attachment.url,
					name: attachment.name
				});
			});

			let sender = `${message.author.username}`;
			if (message.content.startsWith('-')) sender = 'VTA Staff';

			member?.send({ content: `[${sender}] ${message.content}`, files: attachments }).then((msg) => {
				if (user.ModMail === undefined) return;

				let msgAttachments: string[] = [];
				msg.attachments.forEach((attachment) => msgAttachments.push(`${attachment.url}`));

				let MsgArray = user.ModMail?.Messages ?? [];
				MsgArray.push({
					ts: `${new Date().toUTCString()}`,
					username: message.author.username,
					content: message.content,
					attachments: msgAttachments
				});
				user.ModMail.Messages = MsgArray;
				user.save();
			});

			message.react('📨');
		}
	}

	private async sendThread(message: Message, threadID: string, user: any) {
		const server: Guild = (await message.client.guilds.fetch(`${process.env.ServerID}`).catch(() => {
			message.client.logger.fatal('Failed to retrieve Discord server during ModMail');
		})) as Guild;

		const modMailChannel = (await server.channels.fetch(`${process.env.ModMailChannel}`)) as ForumChannel;
		const webhook = (await modMailChannel.fetchWebhooks()).first();

		const attachments: any[] = [];
		message.attachments.forEach((attachment) => {
			attachments.push({
				attachment: attachment.url,
				name: attachment.name
			});
		});

		let MsgArray = (await user.ModMail?.Messages) ?? [];
		MsgArray.push({
			ts: `${new Date().toUTCString()}`,
			username: message.author.username,
			avatarURL: message.author.avatarURL(),
			content: message.content
		});
		user.ModMail.Messages = MsgArray;
		user.save();

		message.react('📨');
		return webhook?.send({
			avatarURL: `${message.author.avatarURL()}`,
			username: `${message.author.username}`,
			threadId: threadID,
			content: message.content,
			files: attachments
		});
	}
}
