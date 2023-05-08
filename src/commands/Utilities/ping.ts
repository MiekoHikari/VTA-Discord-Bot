import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Ping the bot to see how delayed your responses may be in the current hour!',
	requiredClientPermissions: 'SendMessages',
	cooldownDelay: 5000
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register Chat Input command
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setDescription(this.description),
			{ guildIds: ['1044538681203118090'] }
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendPing(interaction);
	}

	private async sendPing(interaction: Command.ChatInputCommandInteraction) {
		const pingMessage = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle('Pong!')
			.setDescription('The bot received your request successfully!')
			.setColor([59, 75, 127])
			.addFields(
				{ name: 'Bot Latency', value: `${Math.round(this.container.client.ws.ping)}ms`, inline: true },
				{ name: 'API Latency', value: `${pingMessage.createdTimestamp - interaction.createdTimestamp}ms` }
			);

		return interaction.editReply({
			content: '',
			embeds: [embed]
		});
	}
}
