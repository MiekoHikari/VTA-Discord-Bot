import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { EmbedField } from 'discord.js';

import handbookEmbed from '../../assets/embed presets/handbook.json';

@ApplyOptions<Command.Options>({
	name: 'handbook',
	description: 'Review the VTA Handbook!',
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
					.setDescription(this.description)
					.addStringOption((option) =>
						option
							.setName('chapter')
							.setDescription('Which chapter of the handbook you want to view')
							.addChoices({ name: 'Introduction', value: 'Introduction' })
							.addChoices({ name: 'Rules', value: 'Rules' })
							.addChoices({ name: 'Moderation Policy', value: 'Moderation' })
							.addChoices({ name: 'Roles', value: 'Roles' })
							.addChoices({ name: 'Community Engagement', value: 'Community Engagement' })
							.addChoices({ name: 'Frequently Asked Questions', value: 'Frequently Asked Questions' })
							.setRequired(true)
					)
					.addBooleanOption((option) => option.setName('hidden').setDescription('Hide the reply or not').setRequired(true)),
			{ guildIds: ['1044538681203118090'] }
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const chapter = interaction.options.getString('chapter', true);

		const handbookObject = handbookEmbed[chapter as keyof typeof handbookEmbed];
		this.sendEmbed(this.infoEmbed(handbookObject.embed.id, handbookObject.embed.title, handbookObject.embed.description, handbookObject.embed.fields), interaction);
	}

	private sendEmbed(embed: EmbedBuilder, interaction: Command.ChatInputCommandInteraction) {
		const ephemeralBool = interaction.options.getBoolean('hidden', true);

		return interaction.reply({
			embeds: [embed],
			ephemeral: ephemeralBool
		});
	}
	private infoEmbed(id: string, title: string, description: string, fields: Array<EmbedField>) {
		const embed = new EmbedBuilder()
			.setColor([233, 77, 81])
			.setAuthor({ name: id })
			.setTitle(title)
			.setDescription(description)
			.addFields(fields);

		return embed;
	}
}
