import * as mongoose from 'mongoose';
import {IUser} from "../interface/user";

const UserSchema = new mongoose.Schema ({
    firstName: {
        type: String,
        validate: {
            message: 'no numbers allowed in first name',
            validator: function(value: string) {
                return !/\d/.test(value);
            }
        }
    },
    lastName: {
        type: String,
        validate: {
            message: 'no numbers allowed in last name',
            validator: function(value: string) {
                return !/\d/.test(value);
            }
        }
    },
    email: {
        type: String,
        validate: {
            message: 'You need an @ in email',
            validator: function(value: string) {
                    return value.includes('@');
                }
        }
    },
    username: {
        type: String,
        validate: {
            message: 'username needs to be less than 30 characters long',
            validator: function (value: string) {
                return value.length < 30;
            }
        }
    },
    password: {
        type: String,
        validate: {
            message: 'password hash needs to start with $2',
            validator: function (value: string) {
                return value.substr(0, 2) === '$2';
            }
        }
    }
});

UserSchema.pre<IUser>('validate', function(next){
   if(!this.email.includes('@')) {
       next(new Error('Need a @ in email'))
   }

   next();
});

UserSchema.virtual('fullName')
    .get(function (this: IUser) {
        return this.firstName + ' ' + this.lastName;
    }).set(function (this: IUser, fullName: string) {
        if(!fullName.includes(' ')) {
            throw new Error('Full name must have a space between the first and last name')
        }

        const [firstName, lastName]: string[] = fullName.split(' ');
        this.firstName = firstName;
        this.lastName = lastName;
    });

export const User = mongoose.model<IUser>('User', UserSchema);