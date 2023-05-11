// Future Plans is when we get a web server running, accept ban appeal forms online!

import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Timestamp } from '@sapphire/time-utilities';
import { AttachmentBuilder, EmbedBuilder, TextChannel, User } from 'discord.js';
import modProfile from '../../../assets/db.models/ModerationProfile';

@ApplyOptions<Command.Options>({
	description: 'Ban targetted member',
	requiredClientPermissions: ['BanMembers'],
	requiredUserPermissions: ['BanMembers']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('target').setDescription('The target user to ban').setRequired(true))
				.addStringOption((option) => option.setRequired(true).setName('reason').setDescription('Why are you banning this user?'))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = await interaction.options.getUser('target', true);
		const reason = await interaction.options.getString('reason', true);

		const embed = new EmbedBuilder()
			.setAuthor({ name: `Banned by ${interaction.user.username}` })
			.setColor('DarkRed')
			.setTitle('You are permanently banned from the VTuber Academy 💔')
			.setDescription('You will no longer have any rights to join back in. Evading bans will perma ban you.')
			.addFields(
				{ name: 'Reason', value: `${reason}`, inline: false },
				{ name: 'Ban Appeals', value: 'It is possible to appeal for a ban, DM @VTuberAcademy Twitter' }
			);

		await this.logAction(interaction, target, reason);
		interaction.reply(
			`${target.username} has been banned for ${reason}\n\nRead the handbook to remind yourselves on how to maintain peace in VTA!`
		);
		return target.send({ embeds: [embed] }).then(() => {
			interaction.guild?.bans.create(target, { reason: `[${interaction.user.username}] ${reason}`, deleteMessageSeconds: 604800 });
		});
	}

	private async logAction(interaction: Command.ChatInputCommandInteraction, target: User, reason: string) {
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
			.setTitle(`${target.username} has been expelled.`)
			.addFields(
				{ name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
				{ name: 'Target', value: `<@${target?.id}>`, inline: true },
				{ name: 'Reason', value: `${reason}`, inline: false }
			)
			.setColor('Red');

		return Channel.send({
			embeds: [embed],
			files: [attachment]
		}).then(() => {
			modProfile.findOne({ DiscordID: target?.id }).then(async (user) => {
				if (!user) return;
				user.deleteOne();
			});
		});
	}
}
