import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Strike a user for violating a policy',
	requiredUserPermissions: ['BanMembers', 'ManageNicknames', 'KickMembers', 'ModerateMembers'],
	requiredClientPermissions: ['BanMembers', 'ManageNicknames', 'KickMembers', 'ModerateMembers']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(option => 
					option
					.setName('target')
					.setDescription('The user to strike')
					.setRequired(true)
				)
				.addStringOption(option => 
					option
					.setName('breach')
					.setDescription('The breached rule')
					.addChoices(
						{ name: '0. Discord Account Violation', value: '0' },
						{ name: '1. Server Profile Violation', value: '1' },
						{ name: '2. Texting Violation', value: "2"},
						{ name: '3. Voice Violation', value: '3'},
						{ name: 'Other', value: '4'}
					)
					.setRequired(true)
				)
				.addStringOption(option => 
					option
					.setName('reason')
					.setDescription('Provide reason for strike')
					.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const target = await interaction.options.getMember('target');
		const violation = await interaction.options.getString('breach', true);
		const reason = await interaction.options.getString('reason', true);
		return interaction.reply({ content: 'Hello world!' });
	}
}
