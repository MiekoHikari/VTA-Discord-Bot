import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import {
	EmbedBuilder,
	type ButtonInteraction,
	type ForumChannel,
	GuildMember,
	Guild,
	Webhook,
	ThreadChannel,
	Message,
	AttachmentBuilder
} from 'discord.js';
import modProfile from '../assets/db.models/ModerationProfile';
import { Timestamp } from '@sapphire/time-utilities';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public async run(interaction: ButtonInteraction) {
		// If the user created a ModMail thread through DMs
		if (interaction.customId === 'modmail-confirm') {
			// Get the user's mod profile from the database
			let user = await modProfile.findOne({ DiscordID: interaction.user.id });

			// Check if the user exists in the database
			if (!user) {
				user = new modProfile({
					DiscordID: `${interaction.user.id}`,
					Strikes: []
				});

				await user.save();
			}

			// Get the user's strike history from the fetched database
			let history = user?.Strikes?.map((strike) => `[${strike.ViolationType}] [${strike.Date}] [${strike.messageURL}]`).reverse() || [];

			// Fetch the guildMember and their member roles
			const guild = (await interaction.client.guilds.fetch(`${process.env.ServerID}`)) as Guild;
			const guildMember = await guild.members.fetch(`${interaction.user.id}`);
			const memberRoles = guildMember.roles.cache.map((role) => `<@&${role.id}>`);

			// Setup member embed
			const memberEmbed = new EmbedBuilder()
				.setAuthor({ name: 'Discord Information' })
				.setColor('Blurple')
				.setTitle(`@${guildMember.user.username}`)
				.setDescription(`All the information you may need to know about the user.`)
				.setFields(
					{ name: 'UserID', value: `${interaction.user.id}`, inline: true },
					{ name: 'Nickname', value: `${guildMember.nickname ?? 'No Nickname set!'}`, inline: true },
					{ name: 'Roles', value: `${memberRoles.join()}`, inline: false },
					{ name: 'Last 5 Strikes', value: `${history.slice(0, 4).join('\n')}`, inline: false },
					{ name: 'Server Join Date', value: `${guildMember.joinedAt}`, inline: true },
					{ name: 'Account Create Date', value: `${interaction.user.createdAt}`, inline: true }
				)
				.setThumbnail(`${interaction.user.displayAvatarURL()}`);

			// Get modmail channel and its webhook
			const ModMailChannel = (await guild.channels.fetch(`${process.env.ModMailChannel}`)) as ForumChannel;
			const webhooks = await ModMailChannel.fetchWebhooks();
			const webhook = webhooks.first();

			// Setup a new thread with the following options:
			const ModMailThread = await ModMailChannel.threads.create({
				name: `${interaction.user.username}`,
				message: {
					content: `I summon all <@&${process.env.ModRole}> to respond to the new thread by <@${interaction.user.id}>!`,
					embeds: [memberEmbed]
				},
				reason: `VTA ModMail Create`
			});

			// Get the message and its attachments
			const message = (await interaction.channel?.messages.fetch(interaction.message.content)) || interaction.message;
			const attachments = message.attachments.map((attachment) => ({
				attachment: attachment.url,
				name: attachment.name
			}));

			// send the webhook under the impression of the modmail user in the thread.
			webhook
				?.send({
					avatarURL: `${message.author.avatarURL()}`,
					username: `${message.author.username}`,
					threadId: ModMailThread.id,
					content: message.content,
					files: attachments
				})
				.then((msg) => {
					if (!user) return;

					const msgAttachments = msg.attachments.map((attachment) => attachment.url);
					const MsgArray = [
						{
							ts: new Date().toUTCString(),
							username: interaction.user.username,
							content: message.content,
							attachments: msgAttachments
						}
					];

					user.ModMail = {
						ThreadID: ModMailThread.id,
						Messages: MsgArray
					};

					user.save();
				});

			// Thread success embed
			const embed = new EmbedBuilder()
				.setTitle('Thread successfully created!')
				.setDescription('ModMail logs are available at the end of the thread.')
				.setTimestamp();

			interaction.message.edit({ content: 'ModMail Thread Created!', embeds: [embed], components: [] });
		}

		// If the user created a ModMail thread through reporting
		if (interaction.customId === 'modmail-report') {
			// Get user Database profile
			const getUserProfile = async (DiscordID: string) => {
				let userProfile = await modProfile.findOne({ DiscordID });
				if (!userProfile) {
					userProfile = new modProfile({
						DiscordID,
						Strikes: []
					});
					await userProfile.save();
				}
				return userProfile;
			};

			// Get User Strike History
			const getStrikeHistory = (user: any) => {
				return user?.Strikes?.map((strike: any) => `[${strike.ViolationType}] [${strike.Date}] [${strike.messageURL}]`).reverse() || [];
			};

			// Create embed for the reporter
			const createMemberEmbed = (guildMember: GuildMember, memberRoles: string[], history: string[]) => {
				const memberEmbed = new EmbedBuilder()
					.setAuthor({ name: 'Discord Information' })
					.setColor('Blurple')
					.setTitle(`@${guildMember.user.username}`)
					.setDescription('All the information you may need to know about the user.')
					.setFields(
						{ name: 'UserID', value: `${guildMember.user.id}`, inline: true },
						{ name: 'Nickname', value: `${guildMember.nickname ?? 'No Nickname set!'}`, inline: true },
						{ name: 'Roles', value: `${memberRoles.join()}`, inline: false },
						{ name: 'Last 5 Strikes', value: `${history.slice(0, 4).join('\n')}`, inline: false },
						{ name: 'Server Join Date', value: `${guildMember.joinedAt}`, inline: true },
						{ name: 'Account Create Date', value: `${guildMember.user.createdAt}`, inline: true }
					)
					.setThumbnail(guildMember.user.displayAvatarURL());
				return memberEmbed;
			};

			// Create embed for the reported
			const createReportEmbed = (reportedUser: GuildMember, memberRoles: string[], history: string[]) => {
				const reportEmbed = new EmbedBuilder()
					.setAuthor({ name: "Reported's Information" })
					.setColor('Red')
					.setTitle(`@${reportedUser.user.username}`)
					.setDescription("Have a careful look at the reported's information and use VTA Bot's tools at your disposal.")
					.setFields(
						{ name: 'UserID', value: `${reportedUser.user.id}`, inline: true },
						{ name: 'Nickname', value: `${reportedUser.nickname ?? 'No Nickname set!'}`, inline: true },
						{ name: 'Roles', value: `${memberRoles.join()}`, inline: false },
						{ name: 'Last 5 Strikes', value: `${history.slice(0, 4).join('\n')}`, inline: false },
						{ name: 'Server Join Date', value: `${reportedUser.joinedAt}`, inline: true },
						{ name: 'Account Create Date', value: `${reportedUser.user.createdAt}`, inline: true }
					)
					.setThumbnail(reportedUser.user.displayAvatarURL());
				return reportEmbed;
			};

			// Create message logs
			const createMessageLogs = async (interaction: ButtonInteraction) => {
				const messageLogs = [];
				const timestamp = new Timestamp('DD-MM-YYYY HH:mm');
				const messages = await interaction.channel?.messages.fetch({ limit: 26 });
				if (messages) {
					for (const message of messages.values()) {
						const attachments = message.attachments.map((attachment) => attachment.url);
						const log = `[${timestamp.displayUTC(message.createdTimestamp)}] [${message.author.username}]\n${
							message.content
						}\n${attachments}`;
						messageLogs.push(log);
					}
				}
				return messageLogs.reverse().join('\n');
			};

			// Create ModMail Thread
			const createUserThread = async (ModMailChannel: ForumChannel, memberEmbed: EmbedBuilder, interaction: ButtonInteraction) => {
				const ModMailThread = await ModMailChannel.threads.create({
					name: interaction.user.username,
					message: {
						content: `I summon all <@&${process.env.ModRole}> to respond to the new thread by <@${interaction.user.id}>!`,
						embeds: [memberEmbed]
					},
					reason: `VTA ModMail Create`
				});
				return ModMailThread;
			};

			// Send message as a webhook
			const sendWebhookMessage = async (
				webhook: Webhook,
				ModMailThread: ThreadChannel,
				interaction: ButtonInteraction,
				attachments: AttachmentBuilder[],
				embed: EmbedBuilder
			) => {
				const msg = await webhook?.send({
					avatarURL: `${interaction.user.avatarURL()}`,
					username: interaction.user.username,
					threadId: ModMailThread.id,
					content: interaction.message.content,
					embeds: [embed],
					files: attachments
				});
				return msg;
			};

			// Save messages to DB
			const saveMessageToDB = (user: any, interaction: ButtonInteraction, msg: Message) => {
				const msgAttachments = msg.attachments.map((attachment) => attachment.url);
				const newMessage = {
					ts: new Date().toUTCString(),
					username: interaction.user.username,
					content: interaction.message.content,
					attachments: msgAttachments
				};
				user.ModMail = {
					ThreadID: ModMailThread.id,
					Messages: [newMessage]
				};
				return user.save();
			};

			// Get User Database entries
			const userDB = await getUserProfile(interaction.user.id);
			if (userDB.ModMail?.ThreadID) {
				return interaction.message.edit('Bruh you already have a modmail channel opened. Ask staff to close that one first!');
			}
			const reportedDB = await getUserProfile(`${userDB.ModMail?.Target?.id}`);

			// Get all needed variables
			const history = getStrikeHistory(userDB);
			const guildMember = (await interaction.guild?.members.fetch(interaction.user.id)) as GuildMember;
			const memberRoles = guildMember.roles.cache.map((role) => `<@&${role.id}>`);
			const memberEmbed = createMemberEmbed(guildMember, memberRoles, history);

			// Get modmail channel and thread
			const DiscordServer = await interaction.client.guilds.fetch(`${process.env.ServerID}`);
			const ModMailChannel = (await DiscordServer.channels.fetch(`${process.env.ModMailChannel}`)) as ForumChannel;
			const webhooks = await ModMailChannel.fetchWebhooks();
			const webhook = webhooks.first() as Webhook;

			// Create ModMail Thread
			const ModMailThread = await createUserThread(ModMailChannel, memberEmbed, interaction);

			// Let member know that thread has been created
			interaction.reply({ content: 'Thread created! Check your DMs', embeds: [], components: [], ephemeral: true });

			// Get reported user
			const reportedUser = await interaction.guild?.members.fetch(`${userDB.ModMail?.Target?.id}`) as GuildMember;
			const rhistory = getStrikeHistory(reportedDB);
			const reportEmbed = createReportEmbed(reportedUser, memberRoles, rhistory);

			// Get message logs and create a new attachment
			const messageLogs = await createMessageLogs(interaction);
			const attachment = new AttachmentBuilder(Buffer.from(messageLogs), { name: 'logs.txt' });

			// send the message as a webhook
			const msg = await sendWebhookMessage(webhook, ModMailThread, interaction, [attachment], reportEmbed);

			// Check if user has DB
			if (userDB) {
				await saveMessageToDB(userDB, interaction, msg);
			}

			// Change the report message
			interaction.message.edit({
				content: 'ModMail Thread Created!',
				embeds: [
					new EmbedBuilder()
						.setTitle('Thread successfully created!')
						.setDescription('ModMail logs are available at the end of the thread.')
						.setTimestamp()
				],
				components: []
			});
		}

		return;
	}

	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('modmail-')) return this.none();

		return this.some();
	}
}
