import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import { IEntry } from '../interface/entry';

const EntrySchema: Schema = new Schema ({
   message: {
      type: String,
      validate: {
         message: 'message needs to be less than 500 characters',
         validator: function(value: string) {
            return value.length < 500;
         }
      }
   },
   username: {
      type: String,
      validate: {
         message: 'username is required to not be null or undefined',
         validator: function (value: string) {
            return value !== null && value !== undefined;
         }
      }
   },
   likes: {
      type: Number,
      validate: {
         message: 'likes need to be greater than or equal to 0',
         validator: function(value: number) {
            return value >= 0;
         }
      }
   },
});

export const Entry = mongoose.model<IEntry>('Entry', EntrySchema);