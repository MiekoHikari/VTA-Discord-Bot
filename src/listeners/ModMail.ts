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
		message.client.logger.debug(message.channel.type === ChannelType.DM);
		if (!message.channel.isDMBased()) return; // Exit early if the message is not from a DM channel

		const user = await modProfile.findOne({ DiscordID: message.author.id });

		if (!user) {
			await modProfile.create({
				DiscordID: message.author.id
			});
		}

		if (user?.ModMail?.ThreadID) {
			return this.sendThread(message, user.ModMail.ThreadID);
		}

		const embed = new EmbedBuilder()
			.setTitle('Want to create a new ModMail thread?')
			.setDescription('We can\'t find an existing modmail thread under your username')
			.setColor('Random')
			.setTimestamp();

			const confirm = new ButtonBuilder()
			.setCustomId('modmail-confirm')
			.setLabel('Create Thread 🧵')
			.setStyle(ButtonStyle.Secondary);

		const row: any = new ActionRowBuilder()
			.addComponents(confirm);

		return message.channel.send({embeds: [embed], components: [row]});
	}

	private async sendThread(message: Message, threadID: string) {
		const server: Guild = await (message.client.guilds.fetch(`${process.env.ServerID}`).catch(() => {
			message.client.logger.fatal('Failed to retrieve Discord server during ModMail');
		})) as Guild;

		const modMailChannel = await (server.channels.fetch(`${process.env.ModMailChannel}`)) as ForumChannel;
		const webhook = (await modMailChannel.fetchWebhooks()).first()

		const attachments: any[] = [];
		message.attachments.forEach(attachment => {
		  attachments.push({
			attachment: attachment.url,
			name: attachment.name
		  });
		});
		
		return webhook?.send({
			avatarURL: `${message.author.avatarURL()}`,
			username: `${message.author.username}`,
			threadId: threadID,
			content: message.content,
			files: attachments
		})
	}
}
