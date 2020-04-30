import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {User} from './models/user';
import {Entry} from './models/entry';
import {Reply} from './models/reply';
import {Session} from "./models/session";
import {userCookieMiddleware} from "./middleware/UserCookieMiddleware";
import {strongParamsMiddleware} from "./middleware/StrongParamsMiddleware";
import WebSocket from 'ws';
import cors from 'cors';
import path from 'path'

dotenv.config();

const clientAppDirectory = path.join(__dirname, '../build/public', 'build');

const app = express();

app.use(express.json());

app.use(express.static(clientAppDirectory));

app.use(cors({
    origin: 'http://localhost:3000', corsConfig: {origin: 'http://localhost:3000', credentials: true},
    sessionConfig: {secret: process.env.COOKIE_SECRET, cookie: {secure: true, httpOnly: true, domain: 'http://localhost:3000'}}
}));

app.use(cookieParser(process.env.COOKIE_SECRET));

mongoose.connect(process.env.ATLAS_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.once('open', async () =>{
    console.log('connected to mongodb');
});

const webSocketServer: WebSocket.Server = new WebSocket.Server({port: 5000});

export interface IPost {
    message: string,
    username: string
}

webSocketServer.on('connection', (webSocketClient: WebSocket) => {

    webSocketClient.on('message', async (post: string) => {
        const newPost = JSON.parse(post);
        const username = newPost.username;
        const message = newPost.message;
        if(message !== '' || username !== '') {
            const user = await User.findOne({username});
            if (user === null) {
                console.log('Post could not be made')
            } else {
                const entry = new Entry({
                    message: message,
                    username: username,
                    likes: 0
                });
                await entry.save();

                webSocketServer.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(entry));
                    }
                });

            }
        }
    });
});

app.get(
    '/requiredCookieRoute', [userCookieMiddleware], async (request: Request, response: Response) => {
    const session = await Session.findOne({sessionID: response.locals.sessionID});
    if(session !== undefined) {
        const user = await User.findOne({_id: session.userID});
        return response.status(200).send(user.username);
    }
    return response.sendStatus(400);
});

app.post('/user',
    [strongParamsMiddleware({
        username: 'string',
        password: 'string',
        email: 'string',
        firstName: 'string',
        lastName: 'string'
    })],
    async(request: Request, response: Response) => {

        const strongParams = response.locals?.strongParams;

        const username: string | undefined = strongParams?.username;
        const password: string | undefined = strongParams?.password;
        const email: string | undefined = strongParams?.email;
        const firstName: string | undefined = strongParams?.firstName;
        const lastName: string | undefined = strongParams?.lastName;

        if(username !== '' && email !== '' && password !== '') {
            const newpassword = bcrypt.hashSync(password, 10);
            const user = new User ({
                email: email,
                username: username,
                password: newpassword,
                firstName: firstName,
                lastName: lastName
            });
            const name = firstName + ' ' + lastName;
            const newUser = {email: email, username: username, name: name};
            await user.save();
            return response.status(200).send(newUser);
        } else {
            return response.sendStatus(400);
        }
});

// This is where our session should be created
app.post('/user/isValid',
    [strongParamsMiddleware({email: 'string', password: 'string'})],
    async (request: Request, response: Response) => {

        const strongParams = response.locals?.strongParams;
        const email: string | undefined = strongParams?.email;
        const password: string | undefined = strongParams?.password;

        if(email !== '' || password !== '') {
            const user = await User.findOne({email});
            if(user && bcrypt.compareSync(password, user.password)) {
                const current_date = (new Date()).valueOf().toString();
                const random = Math.random().toString();
                const hash = crypto.createHash('sha256').update(current_date + random).digest('hex');

                const session = new Session({
                    sessionID: hash,
                    userID: user._id
                });
                await session.save();
                const newUser = {name: user.fullName, username: user.username};
                response.cookie('sessionID', hash, {signed: true, httpOnly: true});
                return response.status(200).send(newUser);
            }
        }
        return response.sendStatus(400);
});

app.post('/user/logout', [userCookieMiddleware], async(request, response) => {
     await Session.deleteOne({sessionID: response.locals.sessionID});
     response.clearCookie('sessionID').sendStatus(200);
});

app.post('/entry',
    [strongParamsMiddleware({message:'string', username:'string'})],
    async (request, response) => {

        const strongParams = response.locals?.strongParams;
        const username: string | undefined = strongParams?.username;
        const message: string | undefined = strongParams?.message;

        if(message !== '' || username !== '') {
           const user = await User.findOne({username});
           if(user === null) {
               return response.sendStatus(404);
           } else {
               const entry = new Entry({
                  message: message,
                  username: username,
                  likes: 0
               });
               await entry.save();
               return response.status(201).send(entry._id);
           }
        } else {
           return response.sendStatus(400);
        }
});

app.get('/entry', async (request, response) => {
    const entries = await Entry.find({});
    const newEntries = entries.map((entry) => {
        return {
            message: entry.message,
            username: entry.username
        };
    });
    return response.status(200).send(newEntries);
});

app.post('/reply',
    [strongParamsMiddleware({message:'string',entryID:'string',username:'string'})],
    async (request, response) => {

        const strongParams = response.locals?.strongParams;
        const message: string | undefined = strongParams?.message;
        const entryID: string | undefined = strongParams?.entryID;
        const username: string | undefined = strongParams?.username;

        if(message !== '') {
           const user = await User.findOne({username});
           if(user === null) {
               return response.sendStatus(404);
           } else {
               const reply = new Reply({
                   message: message,
                   likes: 0,
                   creatorID: user._id,
                   entryID: entryID
               });
               await reply.save();
               return response.sendStatus(201);
           }
        } else {
           return response.sendStatus(400);
        }
});

app.get('/*', async (request: Request, response: Response) => {
    const indexPath = path.join(clientAppDirectory, 'index.html');

    return response.sendFile(indexPath);
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log('server is up'));

module.exports = app;