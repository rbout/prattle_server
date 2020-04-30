import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import {IReply} from '../interface/reply';

const ReplySchema: Schema = new Schema({
    message: {
        type:String,
        validate: {
            message: 'message is under 500 characters',
            validator: function (value: string) {
                return value.length < 500;
            }
        }
    },
    creatorID: {
        type: String,
        validate: {
            message: 'creatorID is 24 characters',
            validator: function (value: string) {
                return value.length === 24;
            }
        }
    },
    entryID: {
        type: String,
        validate: {
            message: 'entryID is 24 characters',
            validator: function (value: string) {
                return value.length === 24;
            }
        }
    },
    likes: {
        type: Number,
        validate: {
            message: 'likes need be greater than or equal to 0',
            validator: function (value: number) {
                return value >= 0;
            }
        }
    },
});

ReplySchema.pre<IReply>('validate', function(next) {
    next();
});

export const Reply = mongoose.model<IReply>('Reply', ReplySchema);