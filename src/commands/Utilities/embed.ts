import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Create an embed on the loaded presets',
	requiredClientPermissions: ['SendMessages', 'EmbedLinks'],
	cooldownDelay: 5000,
	requiredUserPermissions: ['ManageMessages']
})
export class UserCommand extends Command {
	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option //
						.setName('preset')
						.setDescription('Select the preset to embed')
						.setRequired(true)
				), { guildIds: ['1044538681203118090'] }
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const presetOption = interaction.options.getString('preset', true);

		if (presetOption == 'handbook') return this.handbook(interaction);
	}

	private async handbook(interaction: Command.ChatInputCommandInteraction) {
		const embed1 = new EmbedBuilder()
			.setColor([43, 45, 49])
			.setImage('https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Cover.png');

		const embed2 = new EmbedBuilder()
			.setColor([233, 77, 81])
			.setAuthor({ name: '#Author' })

		interaction.channel?.send({
			embeds: [embed1, embed2],
		})
	}
}
