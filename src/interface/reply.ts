import {Document} from 'mongoose';

export interface IReply extends Document {
    message: string
    creatorID: string
    entryID: string
    likes: number
}