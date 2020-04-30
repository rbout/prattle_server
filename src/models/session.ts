import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import {ISession} from "../interface/session";

const SessionSchema: Schema = new Schema({
    sessionID: {
        type: String
    },
    userID: {
        type: String
    }
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);