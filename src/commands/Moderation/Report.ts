import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import modProfile from '../../assets/db.models/ModerationProfile';

@ApplyOptions<Command.Options>({
	description: 'Report a member for a breach',
	requiredClientPermissions: ['SendMessages'],
	cooldownDelay: 5000
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('target').setDescription('The user you want to report').setRequired(true))
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
				.addStringOption((option) => option.setName('reason').setDescription('Be a little more specific').setRequired(true))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = await interaction.options.getUser('target', true);
		const breach = await interaction.options.getString('breach', true);
		const reason = await interaction.options.getString('reason', true);

		// Find or create the modProfile for the interaction user
		let userDB = await modProfile.findOne({ DiscordID: interaction.user.id });

		if (userDB === null) {
			userDB = new modProfile({
				DiscordID: `${interaction.user.id}`,
				Strikes: []
			});

			await userDB.save();
		}

		// Update the ModMail property with the reported user and breach details
		userDB.ModMail = {
			Target: {
				id: target.id,
				breach: { name: breach, reason: reason }
			}
		};

		await userDB.save();

		// Create a confirm button component for the modmail report
		const confirm = new ButtonBuilder().setCustomId('modmail-report').setLabel('Report User ⚠️').setStyle(ButtonStyle.Danger);
		const row: any = new ActionRowBuilder().addComponents(confirm);

		interaction.reply({
			content: `Target: ${target.id}\nBreach: ${breach}\nReason: ${reason}\n\nThis will create a modmail thread in your DMs, make sure your DMs are open!`,
			ephemeral: true,
			components: [row]
		});
	}
}
