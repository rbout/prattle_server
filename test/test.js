const chai = require('chai').use(require('chai-as-promised'));
const expect = chai.expect;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {User} = require('../build/models/user');
const {Reply} = require('../build/models/reply');
const {Entry} = require('../build/models/entry');

describe('User model tests', () => {

    before(async function() {
       await  mongoose.connect('mongodb+srv://rob:pw123@cluster0-cxfch.mongodb.net/test?retryWrites=true&w=majority',
           {useNewUrlParser: true, useUnifiedTopology: true});
    });

    beforeEach(async function() {
        await User.deleteMany({});
    });

    describe('Full name virtual attribute tests', function() {
        it('Should allow setting a full name virtual', async function() {
            const hashpass = bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
            email: 'EMAIL@TEST.COM', password: hashpass});

            expect(user.firstName).to.equal('FIRST-NAME');
            expect(user.lastName).to.equal('LAST-NAME');

            user.fullName = 'test me';

            expect(user.firstName).to.equal('test');
            expect(user.lastName).to.equal('me');

            const savedUser = await user.save();

            expect(savedUser.firstName).to.equal('test');
            expect(savedUser.lastName).to.equal('me');
        });
    });

    describe('First name tests', async function() {
        it('should reject any numbers in first name', async function() {
            const hashpass = bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: '1234', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            try {
                await user.save();
                expect.fail("Expected error not thrown");
            } catch(error) {
                expect(error.message).to.equal('User validation failed: firstName: no numbers allowed in first name');
            }
        });
    });

    describe('Last name tests', async function() {
        it('should reject any numbers in last name', async function() {
            const hashpass = bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: '1234', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            try {
                await user.save();
                expect.fail("Expected error not thrown");
            } catch(error) {
                expect(error.message).to.equal('User validation failed: lastName: no numbers allowed in last name');
            }
        });
    });

    describe('Email attribute tests', function() {
        it('Should reject if no @ symbol', async function() {
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAILTEST.COM', password: 'TEST'});

            try {
                await user.save();
                expect.fail("Expected error not thrown");
            } catch(error) {
                expect(error.message).to.equal('Need a @ in email');
            }
        });
    });

    describe('Password attribute tests', function() {
        it('Non hashed passwords are rejected', async function() {
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: 'password'});

            try {
                await user.save();
                expect.fail("Expected error not thrown");
            } catch(error) {
                expect(error.message).to.equal('User validation failed: password: password hash needs to start with $2');
            }
        });
    });
});


describe('Reply model tests', () =>{
    before(async function() {
        await  mongoose.connect('mongodb+srv://rob:pw123@cluster0-cxfch.mongodb.net/test?retryWrites=true&w=majority',
            {useNewUrlParser: true, useUnifiedTopology: true});
    });

    beforeEach(async function() {
        await Reply.deleteMany({});
        await User.deleteMany({});
        await Entry.deleteMany({});
    });

    describe('creatorID attribute tests', function() {
        it('creatorID should be a length of 24', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            const reply = await new Reply({message: 'TEST REPLY', creatorID: savedUser._id, entryID: savedEntry._id,
                likes: 0});
            const savedReply = await reply.save();
            expect(savedReply.creatorID.length).to.equal(24);
        });
    });

    describe('likes attribute tests', function() {
        it('likes should be equal to 0', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();
            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            const reply = await new Reply({message: 'TEST REPLY', creatorID: savedUser._id, entryID: savedEntry._id,
                likes: 0});
            const savedReply = await reply.save();
            expect(savedReply.likes).to.equal(0);
        });

        it('should reject negative number', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();
            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            const reply = await new Reply({message: 'TEST REPLY', creatorID: savedUser._id, entryID: savedEntry._id,
                likes: -1});
            try {
                await reply.save();

                expect.fail('expected error not thrown')
            } catch(error) {
                expect(error.message).to.equal('Reply validation failed: likes: likes need be greater than or equal to 0');
            }
        });
    });

    describe('entryID attribute tests', function() {
        it('entryID length should be equal to 24', async function(){
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            const reply = await new Reply({message: 'TEST REPLY', creatorID: savedUser._id, entryID: savedEntry._id,
                likes: 0});
            const savedReply = await reply.save();
            expect(savedReply.entryID.length).to.equal(24);
        });
    });

    describe('message attribute tests', function() {
        it('message should be under 500 characters', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            const reply = await new Reply({message: 'TEST REPLY', creatorID: savedUser._id, entryID: savedEntry._id,
                likes: 0});
            const savedReply = await reply.save();
            expect(savedReply.message.length < 500).to.equal(true);
        })
    });
});

describe('Entry model tests', function() {
    before(async function() {
        await  mongoose.connect('mongodb+srv://rob:pw123@cluster0-cxfch.mongodb.net/test?retryWrites=true&w=majority',
            {useNewUrlParser: true, useUnifiedTopology: true});
    });

    beforeEach(async function() {
        await User.deleteMany({});
        await Entry.deleteMany({});
    });

    describe('message attribute tests', function() {
        it('message should be under 500 characters', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            expect(savedEntry.message.length < 500).to.equal(true);
        });

        it('should reject messages larger than 500 characters', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'In my younger and more vulnerable years, my father gave me some ' +
                    'advice that I’ve been turning over in my mind ever since. ‘Whenever you feel like criticizing ' +
                    'anyone,’ he told me, ‘just remember that all the people in this world haven’t had the advantages ' +
                    'that you’ve had.’ He didn’t say any more but we’ve always been unusually communicative in a ' +
                    'reserved way, and I understood that he meant a great deal more than that. In consequence, I’m ' +
                    'inclined to reserve all judgments, a habit that has opened up many curious natures to me and also ' +
                    'made me the victim of not a few veteran bores.', creatorID: savedUser._id, likes: 0});

            try {
                await entry.save();

                expect.fail('expected error not thrown')
            } catch(error) {
                expect(error.message).to.equal('Entry validation failed: message: message needs to be less than 500 characters');
            }
        });
    });

    describe('likes attribute tests', async function() {
        it('likes should equal 0', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: 0});
            const savedEntry = await entry.save();
            expect(savedEntry.likes).to.equal(0);
        });

        it('should reject negative number', async function() {
            const hashpass = await bcrypt.hashSync('TEST', 10);
            const user = await new User({firstName: 'FIRST-NAME', lastName: 'LAST-NAME', username: 'USERNAME',
                email: 'EMAIL@TEST.COM', password: hashpass});
            const savedUser = await user.save();

            const entry = await new Entry({message: 'TEST MESSAGE', creatorID: savedUser._id, likes: -1});
            try {
                await entry.save();

                expect.fail('expected error not thrown')
            } catch(error) {
                expect(error.message).to.equal('Entry validation failed: likes: likes need to be greater than or equal to 0');
            }
        });
    });
});