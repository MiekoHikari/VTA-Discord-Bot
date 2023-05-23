import { Listener, LogLevel, type ChatInputCommandSuccessPayload } from '@sapphire/framework';
import type { Logger } from '@sapphire/plugin-logger';
import { logSuccessCommand } from '../../../lib/pre-setup/utils';

export class UserListener extends Listener {
	public run(payload: ChatInputCommandSuccessPayload) {
		logSuccessCommand(payload);
	}

	public onLoad() {
		this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}
}
