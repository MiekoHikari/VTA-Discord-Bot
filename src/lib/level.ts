import type { Message } from 'discord.js';
import { EventEmitter } from 'events';
import levelProfile from '../assets/db.models/levelProfile';

class LevelManager extends EventEmitter {
	constructor() {
		super();
	}

	async updateUserLevel(user: any, message: Message) {
		if (message.author.bot) return;
		const nextLevel = Math.trunc(user.Experience / calculateXPForLevel(user.Level + 1));

		if (nextLevel > 0) { // Emit the 'LevelUp' event only if the user actually leveled up
			const dbUser = await levelProfile.findOne({ DiscordID: user.id }) ?? user;
			dbUser.Level = dbUser.Level + 1;
			await dbUser.save();

			return this.emit('LevelUp', message, user.DiscordID);
		}

		return;
	}
}

function calculateXPForLevel(level: number) {
	const baseXP = 5;
	const exponent = 2;
	const xpRequired = Math.pow(level * baseXP, exponent);
	return xpRequired;
}

// Create the function to give users XP
async function giveUserXP(user: any, amount: number) {
	user.Experience += amount;
	await user.save();
}

const levelManager = new LevelManager();
export default levelManager;
export { giveUserXP, calculateXPForLevel }