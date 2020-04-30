import {Document} from 'mongoose';

export interface IUser extends Document {
    firstName: string,
    lastName: string,
    fullName:string,
    email: string,
    username: string,
    password: string
}