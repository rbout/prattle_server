import mongoose from 'mongoose';
import {User} from './models/user';
import bcrypt from 'bcryptjs';
import {Entry} from "./models/entry";
import {Reply} from "./models/reply";

const main = (async () => {
    await mongoose.connect('mongodb+srv://rob:pw123@cluster0-cxfch.mongodb.net/test?retryWrites=true&w=majority',
        {useNewUrlParser: true, useUnifiedTopology: true});

    const hashPass = bcrypt.hashSync('password', 10);

    const user = await new User({firstName: 'Rob', lastName: 'Bor', email: 'rob@me.com',
        username: 'rob', password: hashPass});
    user.fullName = 'Rob Bor';

    const savedUser = await user.save();
    console.log(savedUser);

    process.exit(0)
});
main();