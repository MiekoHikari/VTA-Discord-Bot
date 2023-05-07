import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { EmbedField } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Create an embed on the loaded presets',
	requiredClientPermissions: ['SendMessages', 'EmbedLinks'],
	cooldownDelay: 5000,
	requiredUserPermissions: ['ManageMessages']
})
export class UserCommand extends Command {
	// Register Chat Input and Context Menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName(this.name)
					.setDescription(this.description)
					.addStringOption((option) =>
						option //
							.setName('preset')
							.setDescription('Select the preset to embed')
							.setRequired(true)
					),
			{ guildIds: ['1044538681203118090'] }
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const presetOption = interaction.options.getString('preset', true);

		if (presetOption == 'handbook') return this.handbook(interaction);
	}

	private async handbook(interaction: Command.ChatInputCommandInteraction) {
		const embed1 = this.embedBanner(
			'https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Cover.png'
		);

		const embed2 = this.infoEmbed(
			'#Introduction',
			'Welcome to the VTuber Academy!',
			'This server is dedicated to providing tips, resources and support to aspiring VTubers who want to learn how to make entertaining content and grow their audiences!\n\nThis handbook is designed to get you up and running in our server, if you ever need the handbook again, just run /handbook in any chat!',
			[]);

		const embed3 = this.embedBanner(
			'https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Etiquettes.png'
		);

		const embed4 = this.infoEmbed(
			'#Rules',
			'Serverwide Rules',
			'To ensure we maintain a positive community, we have laid out some rules for everyone to follow!',
			[{
				name: '0. By using an discord account, you adhere to the following:',
				value: 'Discord ToS: https://discord.com/terms\nCommunity Guidelines: https://discord.com/guidelines',
				inline: false
			},
			{
				name: '1. Server profile policy',
				value: '`1.1 Nicknames / Usernames must be pingable\n1.2 No NSFW or controversial avatars, banners, usernames or nicknames\n1.3 No malicious links in "About me"`',
				inline: false
			},
			{
				name: '2. Texting Policy',
				value: '`2.1 Try to stay relevant to the channel\n2.2 Avoid spamming\n2.3 No NSFW, Political and religion talks\n2.4 Keep drama to a minimum\n2.5 Make sure the person you are talking to is comfortable!\n2.6 This is an english speaking community! Try to speak english only if possible.`',
				inline: false
			},
			{
				name: '3. Voice Policy',
				value: '`3.1 Don\'t purposely be loud or high pitched\n3.2 General Texting policy applies to voicerooms`',
				inline: false
			}]
		);

		const embed5 = this.infoEmbed(
			'#Moderation',
			'Moderation Policy',
			'All moderators reserves the rights to take any action incase of any breaches to this system.',
			[{
				name: 'Disclaimer',
				value: 'Abusing any loopholes in the rules are strictly not tolerated. They are simplified for your understanding.',
				inline: false,
			},
			{
				name: 'When will a user get banned?',
				value: 'Our moderation policy consists of a 3 strikes system. Moderators on the scene of the breach have rights to assign more than 1 strikes based on the severity of the violation.',
				inline: false,
			},
			{
				name: 'Community Involvement',
				value: 'The community can help maintain peace by reporting violations when they happen! You can use the /report command or right click a message and report or DM VTA-Modmail or Modmail bot directly!',
				inline: false
			}]
		);

		const embed6 = this.embedBanner('https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Roles%20and%20Channels.png');
		const embed7 = this.infoEmbed(
			'#Roles',
			'Roles',
			'There are a lot of channels that only specific members with certain roles can view, you can get some of these special items through <#1103870442068004945>!',
			[{
				name: 'Admins and Mods',
				value: 'We don\'t differentiate members with different powers, admins and staff are coloured purple while moderators are camoflauged in the memberlist!',
				inline: false
			},
			{
				name: 'Gaming Club Roles',
				value: 'We sure do have a gaming community within the server! To access the ~~basement~~ streets, grab some roles from <#1103870442068004945>!',
				inline: false
			},
			{
				name: 'VTuber and Artist Roles',
				value: 'We value a user\'s work and identity, for this reason we have many processing for these roles, to get started use /Application enroll',
				inline: false
			},
			{
				name: 'Voice Channels',
				value: 'To use voice channels, we have made it so that you need to be activity level 3 to join. It\'s a security enforcement to prevent trolls and raids.',
				inline: false
			}]
		)

		const embed8 = this.embedBanner('https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Q%26A.png');
		const embed9 = this.infoEmbed(
			'#FAQ',
			'Frequently Asked Questions',
			'Before asking a question regarding VTA, have a look at <#1104266174822363207>! If your question remains unanswered then DM Modmail!',
			[]
		)

		interaction.reply({ content: 'Sent all embeds!', ephemeral: true })

		let msg1: string = 'undefined';
		let msg2: string = 'undefined';
		let msg3: string = 'undefined';
		let msg4: string = 'undefined';
		let msg5: string = 'undefined';

		await interaction.channel?.send({
			embeds: [embed1, embed2]
		}).then((message) => {
			msg1 = message.url;
		});

		await interaction.channel?.send({
			embeds: [embed3, embed4]
		}).then((message) => {
			msg2 = message.url;
		});

		await interaction.channel?.send({
			embeds: [embed5]
		}).then((message) => {
			msg3 = message.url;
		});

		await interaction.channel?.send({
			embeds: [embed6, embed7]
		}).then((message) => {
			msg4 = message.url;
		});

		await interaction.channel?.send({
			embeds: [embed8, embed9]
		}).then((message) => {
			msg5 = message.url;
		});

		const embed10 = new EmbedBuilder()
			.setColor([233, 77, 81])
			.setTitle('Table of Contents')
			.setDescription(`[Introduction](${msg1})\n[Rules](${msg2})\n[Moderation Policy](${msg3})\n[Roles and Channels](${msg4})\n[Frequently Asked Questions](${msg5})`)
			.addFields([{ name: 'You will gain access shortly...', value: 'Wait for 10 minutes before interacting with the server, this is part of our security enforcements to prevent raids', inline: false }]);

		embed10.setImage(interaction.guild?.bannerURL() || 'https://raw.githubusercontent.com/MiekoHikari/VTA-Discord-Bot/major-development/src/assets/embed%20presets/handbook/Banner.webp');

		interaction.channel?.send({
			embeds: [embed10]
		})
	}

	private embedBanner(url: string) {
		const embed = new EmbedBuilder().setColor([43, 45, 49]).setImage(url);

		return embed;
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
