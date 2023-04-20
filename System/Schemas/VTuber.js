const { model, Schema } = require('mongoose');

const VTuberSchema = new Schema({
	DiscordID: String,
	Name: String,
	Description: String,
	AvatarURL: String,
	PreferredStreamingPlatform: String,
	YouTube: String,
	Twitter: String,
	Twitch: String,
	TikTok: String,
	Color: String,
});

module.exports = model('VTuberSchema', VTuberSchema);