import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { EmbedField } from 'discord.js';

@ApplyOptions<Command.Options>({
    name: 'handbook',
	description: 'Review the VTA Handbook!',
	requiredClientPermissions: 'SendMessages',
	cooldownDelay: 5000,
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register Chat Input command
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
                .addStringOption(option => 
                    option
                        .setName('chapter')
                        .setDescription('Which chapter of the handbook you want to view')
                        .addChoices({ name: 'Introduction', value: 'introduction' })
                        .addChoices({ name: 'Rules', value: 'rules' })
                        .addChoices({ name: 'Moderation Policy', value: 'modpolicy' })
                        .addChoices({ name: 'Roles', value: 'roles' })
                        .addChoices({ name: 'FAQ', value: 'faq' })
                        .setRequired(true)
                )
                .addBooleanOption(option => 
                    option
                    .setName('hidden')
                    .setDescription('Hide the reply or not')
                    .setRequired(true)
                ),
			{ guildIds: ['1044538681203118090'] }
		);
	}

	// Chat Input (slash) command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const chapter = interaction.options.getString('chapter', true);

        if (chapter == 'introduction') {
            this.sendEmbed(this.infoEmbed(
                '#Introduction',
                'Welcome to the VTuber Academy!',
                'This server is dedicated to providing tips, resources and support to aspiring VTubers who want to learn how to make entertaining content and grow their audiences!\n\nThis handbook is designed to get you up and running in our server, if you ever need the handbook again, just run /handbook in any chat!',
                []), interaction)
        } else if (chapter == 'rules') {
            this.sendEmbed(this.infoEmbed(
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
            ), interaction)
        } else if (chapter == 'modpolicy') {
            this.sendEmbed(this.infoEmbed(
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
            ), interaction)
        } else if (chapter == 'roles') {
            this.sendEmbed(this.infoEmbed(
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
            ), interaction)
        } else if (chapter == 'faq') {
            this.sendEmbed(this.infoEmbed(
                '#FAQ',
                'Frequently Asked Questions',
                'Before asking a question regarding VTA, have a look at <#1104266174822363207>! If your question remains unanswered then DM Modmail!',
                []
            ), interaction)
        }
	}

    private sendEmbed(embed: EmbedBuilder, interaction: Command.ChatInputCommandInteraction) {
        const ephemeralBool = interaction.options.getBoolean('hidden', true);

        return interaction.reply({
            embeds: [embed],
            ephemeral: ephemeralBool,
        })
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
