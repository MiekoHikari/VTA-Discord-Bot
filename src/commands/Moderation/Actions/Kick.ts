import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Timestamp } from '@sapphire/time-utilities';
import { AttachmentBuilder, EmbedBuilder, TextChannel, User } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Kick the user from VTA',
	requiredClientPermissions: ['KickMembers'],
	requiredUserPermissions: ['KickMembers']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('target').setDescription('The target member').setRequired(true))
				.addStringOption((option) => option.setName('reason').setDescription("Why you're kicking this user").setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = await interaction.options.getUser('target', true);
		const reason = await interaction.options.getString('reason', true);

		// Create an embed to send to the kicked user
		const embed = new EmbedBuilder()
			.setAuthor({ name: `Kicked by ${interaction.user.username}` })
			.setColor('DarkRed')
			.setTitle("You've been shoved out of the door 🚪")
			.setDescription("We just don't want you in VTA, just chill out for a bit before joining back in ya know?")
			.addFields({ name: 'Reason', value: `${reason}` });

		await this.logAction(interaction, target, reason);
		interaction.reply(
			`${target.username} has been kicked for ${reason}\n\nRead the handbook to remind yourselves on how to maintain peace in VTA!`
		);
		return target.send({ embeds: [embed] }).then(() => {
			interaction.guild?.members.kick(target, reason);
		});
	}

	private async logAction(interaction: Command.ChatInputCommandInteraction, target: User, reason: string) {
		const Channel = (await interaction.guild?.channels.fetch(`${process.env.ModLoggingChannel}`)) as TextChannel;

		let messageLogs: Array<string> = [];
		const timestamp = new Timestamp('DD-MM-YYYY HH:mm');

		// Fetch recent messages in the interaction channel
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

		// Create an embed to log the kick action
		const embed = new EmbedBuilder()
			.setTitle(`${target.username} has been suspended.`)
			.addFields(
				{ name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
				{ name: 'Target', value: `<@${target?.id}>`, inline: true },
				{ name: 'Reason', value: `${reason}`, inline: false }
			)
			.setColor('Red');

		return Channel.send({
			embeds: [embed],
			files: [attachment]
		});
	}
}
