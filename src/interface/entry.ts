import { Document } from 'mongoose';

export interface IEntry extends Document{
    message: string
    username: string
    likes: number
}