import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { EmbedBuilder, GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.GuildCreate,
	name: 'memberGuildJoinFunctions'
})
export class UserEvent extends Listener {
	public override run(member: GuildMember) {
		const embed = new EmbedBuilder()
			.setColor('Green')
			.setTitle('Welcome to the VTuber Academy!')
			.setDescription('KitAI and the server moderators welcome you to our humble community! Make sure to check out VTuber Central after the onboarding process!')
			.setFooter({ text: 'This message is sent to notify you that we have acknowledged your membership and logged your presence.' })

		member.send({ embeds: [embed] })
	}
}
