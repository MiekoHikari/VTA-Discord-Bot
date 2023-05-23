import { Schema, model } from 'mongoose';

interface ILevelProfile {
	DiscordID: string;
	Level: number;
	Experience: number;
	OutOfContextMessages: string[];
	LastActivity: Date;
	Knows?: Boolean;
}

const ProfileSchema = new Schema<ILevelProfile>({
	DiscordID: String,
	Level: Number,
	Experience: Number,
	OutOfContextMessages: [String],
	LastActivity: Date,
	Knows: Boolean,
});

const levelProfile = model<ILevelProfile>('LevelProfile', ProfileSchema);
export default levelProfile;
