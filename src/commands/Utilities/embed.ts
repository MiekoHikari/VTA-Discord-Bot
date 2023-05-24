import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { EmbedField } from 'discord.js';

import handbookEmbed from '../../assets/embed presets/handbook.json';

@ApplyOptions<Command.Options>({
	description: 'Create an embed using the loaded presets',
	requiredClientPermissions: ['SendMessages', 'EmbedLinks'],
	cooldownDelay: 5000,
	requiredUserPermissions: ['ManageMessages']
})
export class UserCommand extends Command {
	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) =>
						option
							.setName('preset')
							.setDescription('Select the preset to embed')
							.setRequired(true)
					)
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const presetOption = interaction.options.getString('preset', true);

		if (presetOption === 'handbook') {
			return this.handbook(interaction);
		}
	}

	private async handbook(interaction: Command.ChatInputCommandInteraction) {
		interaction.reply({ content: 'Sending all embeds...', ephemeral: true });

		const contents: string[] = [];
		for (const embedKey in handbookEmbed) {
			const embedObject = handbookEmbed[embedKey as keyof typeof handbookEmbed];

			if (embedObject?.url) {
				await interaction.channel?.send({ embeds: [this.embedBanner(embedObject.url)] });
			}

			await interaction.channel?.send({
				embeds: [this.infoEmbed(embedObject.embed.id, embedObject.embed.title, embedObject.embed.description, embedObject.embed.fields)]
			}).then((embedMsg) => {
				contents.push(`[${embedKey}](${embedMsg.url})`);
			});
		}

		const embed = new EmbedBuilder()
			.setColor([233, 77, 81])
			.setTitle('Table of Contents')
			.setDescription(contents.join('\n'))
			.addFields([
				{
					name: 'You will gain access shortly...',
					value: 'Wait for 10 minutes before interacting with the server. This is part of our security enforcement to prevent raids.',
					inline: false
				}
			]);

		embed.setImage(
			interaction.guild?.bannerURL() ||
				'https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Banner.webp'
		);

		await interaction.channel?.send({ embeds: [embed] });
	}

	private embedBanner(url: string) {
		const embed = new EmbedBuilder().setColor([43, 45, 49]).setImage(url);

		return embed;
	}

	private infoEmbed(id: string, title: string, description: string, fields: EmbedField[]) {
		const embed = new EmbedBuilder()
			.setColor([233, 77, 81])
			.setAuthor({ name: id })
			.setTitle(title)
			.setDescription(description)
			.addFields(fields);

		return embed;
	}
}
