import { Schema, model } from 'mongoose';

interface IModProfile {
    DiscordID: string,
    Strikes: Array<{
        ViolationType: string,
	    Date: string,
		messageURL: string,
    }>,
}

const ProfileSchema = new Schema<IModProfile>({
    DiscordID: {type: String, required: true, unique: true},
    Strikes: Array<{
        ViolationType: string,
	    Date: string,
		messageURL?: string,
    }>,
})

const modProfile = model<IModProfile>('ModerationProfile', ProfileSchema);
export default modProfile;