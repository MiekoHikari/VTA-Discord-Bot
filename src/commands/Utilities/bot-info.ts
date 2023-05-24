import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: "Get information about the bot and its creator!",
	requiredClientPermissions: 'SendMessages',
	cooldownDelay: 5000
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register Chat Input command with guild restriction
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		// Create an embed for the bot information
		const embed = new EmbedBuilder()
			.setColor([255, 255, 255])
			.setDescription(
				"Greetings, world! I am KitAI, a friendly AI created by Mieko Hikari. I'm here to provide support, information, and a friendly chat. Let's embark on this journey together!"
			)
			.setTitle('Hello! I am KitAI!')
			.setThumbnail(interaction.client.user.avatarURL())
			.addFields(
				{
					name: 'VTA Bot',
					value:
						'A Discord bot designed to help you have a better experience in the VTA Discord Server. I was created by Mieko Hikari, a talented developer who loves building tools to help people smile. Mieko Hikari is always working hard to improve me and make me more useful for our community.\n\nIf you have any questions or suggestions for VTA Bot, use the suggestion channel/VTA-ModMail and let him know or check out [github](https://github.com/MiekoHikari/VTA-Discord-Bot/tree/master)!',
				},
				{ name: 'Creator 💙', value: '<@826774272395182101>', inline: true },
				{
					name: 'Support this Project ❤️',
					value: 'Help with server fees over at https://patreon.com/MiekoHikari',
					inline: true,
				}
			)
			.setFooter({ text: 'Thank you for using VTA Bot! | VTA Bot and KitAI are NOT the same' });

		// Reply with the embed as an ephemeral message
		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}
