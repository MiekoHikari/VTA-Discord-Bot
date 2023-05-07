import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'Get information about the bot and it\'s creator!',
	requiredClientPermissions: 'SendMessages',
	cooldownDelay: 5000,
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register Chat Input command
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description),
			{ guildIds: ['1044538681203118090'] }
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor([255, 255, 255])
            .setDescription('A Discord bot designed to help you have a better experience in the VTA Discord Server. I was created by Mieko Hikari, a talented developer who loves building tools to help people smile. Mieko Hikari is always working hard to improve me and make me more useful for our community.\n\nIf you have any questions or suggestions for VTA Bot, feel free to message Mieko Hikari and let him know or check out [github](https://github.com/MiekoHikari/VTA-Discord-Bot/tree/master)!.')
            .setTitle('Hello! I am Kat! (don\'t touch me)')
            .setThumbnail(interaction.client.user.avatarURL())
            .addFields(
				{ name: 'Creator 💙', value: '<@826774272395182101>' },
				{ name: 'Support this Project ❤️', value: 'Help with server fees and the development of KatAI using this link https://streamelements.com/tip/miekohikari' }
			)
			.setFooter({ text: 'Thank you for using VTA Bot!' });
		return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
	}
}
