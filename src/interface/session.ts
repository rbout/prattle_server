import { Document } from 'mongoose';

export interface ISession extends Document{
    sessionID: string,
    userID: string
}

