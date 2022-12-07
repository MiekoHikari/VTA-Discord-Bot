const { Schema, model } = require('mongoose');

const modmailSchema = new Schema({
	_id: Schema.Types.ObjectId,
	userID: String,
	channelID: String,
	Status: String,
	CurrentChannel: String,
	LastRecord: String,
});

module.exports = model('modmail', modmailSchema, 'modmail');