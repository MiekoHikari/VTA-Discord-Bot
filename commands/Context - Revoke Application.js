const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Revoke Application')
		.setType(ApplicationCommandType.User),
	async execute() { return null; },
};
