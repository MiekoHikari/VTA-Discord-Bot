import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, GuildMember } from 'discord.js';
import levelProfile from '../../assets/db.models/levelProfile';
import { calculateXPForLevel } from '../../lib/level';

@ApplyOptions<Command.Options>({
	name: 'profile',
	description: 'View your server profile and all data we have on you!'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('user').setDescription("See someone else's profile? Leave empty to see your own"))
				.addBooleanOption((option) => option.setName('hidden').setDescription('Hide the result or not. By default its true!'))
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		// Retrieve the target user and hidden option from the interaction options
		const target = interaction.options.getUser('user') ?? interaction.user;
		const hidden = interaction.options.getBoolean('hidden') ?? true;

		// Fetch the guild member information based on the target user ID
		const guildMember = (await interaction.guild?.members.fetch(`${target.id}`)) as GuildMember;

		// Get an array of formatted member roles
		const memberRoles = guildMember.roles.cache.map((role) => `<@&${role.id}>`);

		// Create an array to store the embeds
		const embeds: EmbedBuilder[] = [];

		// Create a Discord embed to display basic user information
		const discordEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Discord Information' })
			.setColor('Blurple')
			.setTitle(`@${target.username}`)
			.setDescription(`We have removed discriminators from our system in response to Discord's username change.`)
			.setFields(
				{ name: 'UserID', value: `${target.id}`, inline: true },
				{ name: 'Nickname', value: `${guildMember.nickname ?? 'No Nickname set!'}`, inline: true },
				{ name: 'Roles', value: `${memberRoles.join()}`, inline: false },
				{ name: 'Server Join Date', value: `${guildMember.joinedAt}`, inline: true },
				{ name: 'Account Create Date', value: `${target.createdAt}`, inline: true }
			)
			.setThumbnail(`${target.displayAvatarURL()}`);

		embeds.push(discordEmbed); // Add the Discord embed to the array

		if (!target.bot) {
			// If the target user is not a bot, retrieve their level profile
			const LevelProfile = await levelProfile.findOne({ DiscordID: target.id });
			if (LevelProfile) {
				// Create an embed to display activity information
				const activityEmbed = new EmbedBuilder()
					.setAuthor({ name: 'Activity Information' })
					.setColor('Green')
					.setTitle(`Activity Information`)
					.setDescription(`This is everything we collect on your activity.`)
					.setFields(
						{ name: 'Level', value: `${LevelProfile.Level}`, inline: true },
						{ name: 'Experience', value: `${LevelProfile.Experience} / ${calculateXPForLevel(LevelProfile.Level + 1)}`, inline: true },
						{ name: 'Out of Context Messages', value: `${LevelProfile.OutOfContextMessages.reverse().slice(0, 4).join('\n')}`, inline: false },
						{ name: 'Last Activity', value: `${LevelProfile.LastActivity}`, inline: true }
					)
					.setThumbnail(`${target.displayAvatarURL()}`);

				embeds.push(activityEmbed); // Add the activity embed to the array
			}
		}

		// Send the reply containing the embeds
		return interaction.reply({
			embeds: embeds,
			ephemeral: hidden
		});
	}
}
