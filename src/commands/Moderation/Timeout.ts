import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Duration, DurationFormatter, Timestamp } from '@sapphire/time-utilities';
import { AttachmentBuilder, EmbedBuilder, TextChannel, User } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Mute a member in VTA',
	requiredClientPermissions: ['MuteMembers'],
	requiredUserPermissions: ['MuteMembers']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('target').setDescription('Target member to mute').setRequired(true))
				.addStringOption((option) =>
					option.setName('duration').setDescription('How long the user shall be muted for. (eg. 5d 20h 3m 40s)').setRequired(true)
				)
				.addStringOption((option) => option.setName('reason').setDescription('Provide reason why member is muted').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = await interaction.options.getUser('target', true);
		const duration = new Duration(await interaction.options.getString('duration', true));
		const reason = await interaction.options.getString('reason', true);

		if (duration > new Duration('5s') || duration > new Duration('28d'))
			return interaction.reply({ content: 'Duration must be in range of 5s - 28d', ephemeral: true });

		const epoch = Math.trunc(duration.fromNow.getTime() / 1000);
		const embed = new EmbedBuilder()
			.setAuthor({ name: `Timed out by ${interaction.user.username}` })
			.setColor('Aqua')
			.setTitle('Chill out! 🧊')
			.setDescription("Have a chill pill and perhaps re-read the handbook to make sure this doesn't happen again :)")
			.addFields({ name: 'Reason', value: `${reason}` }, { name: 'Relief in', value: `<t:${epoch}:R>` });

		interaction.reply(
			`${target.username} has been timed out for ${reason}\n\nRead the handbook to remind yourselves on how to maintain peace in VTA!`
		);
		this.logAction(interaction, target, reason, duration);
		return target.send({ embeds: [embed] }).then(() => {
			interaction.guild?.members.fetch(target).then((member) => {
				member.timeout(epoch, reason);
			});
		});
	}

	private async logAction(interaction: Command.ChatInputCommandInteraction, target: User, reason: string, duration: Duration) {
		const Channel = (await interaction.guild?.channels.fetch(`${process.env.ModLoggingChannel}`)) as TextChannel;

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

		const embed = new EmbedBuilder()
			.setTitle(`${target.username} has been... uh... taped on their mouth?`)
			.addFields(
				{ name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
				{ name: 'Target', value: `<@${target?.id}>`, inline: true },
				{ name: 'Duration', value: `${new DurationFormatter().format(duration.offset)}` },
				{ name: 'Reason', value: `${reason}`, inline: false }
			)
			.setColor('Red');

		return Channel.send({
			embeds: [embed],
			files: [attachment]
		});
	}
}
