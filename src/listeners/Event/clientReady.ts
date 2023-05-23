import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ActivityType, type ActivityOptions, type Client, Events } from 'discord.js';

@ApplyOptions<Listener.Options>({
	event: Events.ClientReady,
	name: 'clientReady'
})
export class UserEvent extends Listener {
	public override run(client: Client) {
		const status: ActivityOptions[] = [
			{ type: ActivityType.Playing, name: 'as VTA Cat!' },
			{ type: ActivityType.Listening, name: 'to DMs (DM to Contact Staff)' },
			{ type: ActivityType.Watching, name: `over alot of people...` }
		];

		client.user?.setStatus('dnd');
		client.user?.setActivity(status[Math.floor(Math.random() * status.length)]);

		setInterval(() => {
			client.user?.setStatus('dnd');
			client.user?.setActivity(status[Math.floor(Math.random() * status.length)]);
		}, 300000);
	}
}
