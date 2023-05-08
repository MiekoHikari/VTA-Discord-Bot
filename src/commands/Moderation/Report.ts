import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Report a member for a breach',
	requiredClientPermissions: ['SendMessages'],
	cooldownDelay: 5000
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('target').setDescription('The user you want to report').setRequired(true))
				.addStringOption((option) =>
					option //
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
		// const target = await interaction.options.getUser('target', true);
		// const breach = await interaction.options.getString('breach', true);
		// const reason = await interaction.options.getString('reason', true);

		// Implement Modmail first

		interaction.reply({
			content: 'A moderator will get to you shortly...',
			ephemeral: true
		})
	}
}
