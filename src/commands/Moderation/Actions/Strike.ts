import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { AttachmentBuilder, EmbedBuilder, TextChannel, User } from 'discord.js';
import { Timestamp } from '@sapphire/time-utilities';
import modProfile from '../../../assets/db.models/ModerationProfile';

@ApplyOptions<Command.Options>({
	description: 'Strike a user for violating a policy',
	requiredUserPermissions: ['BanMembers', 'ManageNicknames', 'KickMembers', 'ModerateMembers'],
	requiredClientPermissions: ['BanMembers', 'ManageNicknames', 'KickMembers', 'ModerateMembers']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('target').setDescription('The user to strike').setRequired(true))
				.addStringOption((option) =>
					option
						.setName('breach')
						.setDescription('The breached rule')
						.addChoices(
							{ name: '0. Discord Account Violation', value: '0' },
							{ name: '1. Server Profile Violation', value: '1' },
							{ name: '2. Texting Violation', value: '2' },
							{ name: '3. Voice Violation', value: '3' },
							{ name: 'Other', value: '4' }
						)
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = await interaction.options.getUser('target');
		const violationCode = await interaction.options.getString('breach', true);

		interaction.reply({ content: 'User striked.', ephemeral: true });
		interaction.channel?.send(
			`${target?.username} has been striked for violating the ${await this.parseViolation(
				violationCode
			)}.\n\n[KitAI] Let's turn a new page and make sure we follow the handbook \`/handbook rules\``
		);
		return this.logAction(violationCode, target, interaction);
	}

	private async logAction(violationCode: string, target: User | null, interaction: Command.ChatInputCommandInteraction) {
		const timestamp = new Timestamp('DD-MM-YYYY HH:mm');
		const Channel = (await interaction.guild?.channels.fetch(`${process.env.ModLoggingChannel}`)) as TextChannel;
		let messageLogs: Array<string> = [];

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

		const embed = new EmbedBuilder()
			.setTitle(`@${interaction.user.username} striked @${target?.username}`)
			.setDescription(`${target?.username} is striked for violating the ${await this.parseViolation(violationCode)}.`)
			.addFields({ name: 'Moderator', value: `<@${interaction.user.id}>` }, { name: 'Strike Target', value: `<@${target?.id}>` })
			.setColor('Yellow');

		return Channel.send({
			embeds: [embed],
			files: [attachment]
		}).then((message) => {
			modProfile.findOne({ DiscordID: target?.id }).then(async (user) => {
				if (!user) {
					user = new modProfile({
						DiscordID: `${target?.id}`,
						Strikes: []
					});

					await user.save();
				}

				user?.Strikes?.push({
					ViolationType: `${await this.parseViolation(violationCode)}`,
					Date: `${timestamp.displayUTC()}`,
					messageURL: `${message.url}`
				});

				await user?.save();

				let history: Array<string> = [];
				user?.Strikes?.forEach((strike) => {
					history.reverse().push(`[${strike.ViolationType}] [${strike.Date}] [${strike.messageURL}]`);
				});

				embed.addFields({ name: `Strike History (${history.length})`, value: `${history.join('\n')}` });
				message.edit({
					embeds: [embed]
				});
			});
		});
	}

	private async parseViolation(Id: string) {
		let Violation: string | undefined;

		switch (Id) {
			case '0':
				Violation = 'Discord Account Policy';
				break;
			case '1':
				Violation = 'Server Profile Policy';
				break;
			case '2':
				Violation = 'Texting Policy';
				break;
			case '3':
				Violation = 'Voice Policy';
				break;
			case '4':
				Violation = 'Other Policies';
				break;
		}

		return Violation;
	}
}
