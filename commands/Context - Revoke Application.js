const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Revoke Application')
		.setType(ApplicationCommandType.User)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
	async execute() { return null; },
};
