import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ForumChannel, Guild, Message } from 'discord.js';
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

			if (message.content.startsWith('=close')) {
				// Close thread.
			}

			const member = await message.guild?.members.fetch(user.DiscordID);

			const attachments: any[] = [];
			message.attachments.forEach((attachment) => {
				attachments.push({
					attachment: attachment.url,
					name: attachment.name
				});
			});

			let sender = `${message.author.username}`
			if (message.content.startsWith('-')) sender = 'VTA Staff'

			let MsgArray = user.ModMail.Messages;
			MsgArray.push({ ts: `${Date.now() / 1000}`, username: message.author.username, avatarURL: `${message.author.avatarURL()}`, content: message.content })
			user.ModMail.Messages = MsgArray;
			user.save();

			member?.send({ content: `[${sender}] ${message.content}`, files: attachments })
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

		let MsgArray = await user.ModMail?.Messages ?? [];
		MsgArray.push({ ts: `${Date.now() / 1000}`, username: message.author.username, avatarURL: message.author.avatarURL(), content: message.content })
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
