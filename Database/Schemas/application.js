const { Schema, model } = require('mongoose');

const applicationSchema = new Schema({
	_id: Schema.Types.ObjectId,
	userID: String,
	Status: String,
	AvatarIcon: String,
	VTuberName: String,
	Description: String,
	YouTube: String,
	Twitch: String,
	Twitter: String,
	TikTok: String,
});

module.exports = model('Application', applicationSchema, 'Profiles');