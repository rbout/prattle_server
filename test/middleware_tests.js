const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const httpMocks = require('node-mocks-http');

const UserCookieMiddleware = require('../build/middleware/UserCookieMiddleware').userCookieMiddleware;

const StrongParamsMiddleware = require('../build/middleware/StrongParamsMiddleware').strongParamsMiddleware;

describe('userCookieMiddleware tests', () => {
    it('no signed cookie throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
        });
        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        UserCookieMiddleware(request, response, nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Cookie was required for request but no cookie was found');
    });

    it('sessionID with length of 64 and no letters throws error', () => {
       const request = httpMocks.createRequest({
           method: 'POST',
           url: '/test',
           signedCookies: {
               sessionID: '1111111111111111111111111111111111111111111111111111111111111111'
           }
       });
        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        UserCookieMiddleware(request, response, nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Cookie was required for request but no cookie was found');
    });

    it('sessionID with length smaller than 64 throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            signedCookies: {
                sessionID: 'test'
            }
        });
        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        UserCookieMiddleware(request, response, nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Cookie was required for request but no cookie was found');
    });

    it('sessionID with length of 64 with spaces throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            signedCookies: {
                sessionID: '111111111111111111111111111111111111111111111111111 111111111111'
            }
        });
        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        UserCookieMiddleware(request, response, nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Cookie was required for request but no cookie was found');
    });

    it('sessionID with good hash throws no errors', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            signedCookies: {
                sessionID: '1edee10df852ab3c417a767f9d961cdf364d59c3453a94b9d1d05bcef3a29bfb'
            }
        });
        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        UserCookieMiddleware(request, response, nextFunction);
        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal(undefined);
    });

    it('sessionID with length of 64 and only letters throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            signedCookies: {
                sessionID: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
            }
        });
        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        UserCookieMiddleware(request, response, nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Cookie was required for request but no cookie was found');
    });
});

describe('strongParamsMiddleware tests', () =>{
    it('Good types throw no error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            body: {
                username: 'test',
                email: 'test@me.com',
                password: 'test'
            }
        });

        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        StrongParamsMiddleware({username:'string',email:'string',password:'string'})(request,response,nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal(undefined);
        expect(request.body).to.equal(null);
    });

    it('number types throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            body: {
                username: 1,
                email: 'test@me.com',
                password: 'test'
            }
        });

        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        StrongParamsMiddleware({username:'string',email:'string',password:'string'})(request,response,nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Bad type');
    });

    it('arrow functions throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            body: {
                username: () => {console.log('yo')},
                email: 'test@me.com',
                password: 'test'
            }
        });

        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        StrongParamsMiddleware({username:'string',email:'string',password:'string'})(request,response,nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Bad type');
    });

    it('NoSQL attack throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            body: {
                username: 'rob',
                password: {"&ne": ""}
            }
        });

        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        StrongParamsMiddleware({username:'string',password:'string'})(request,response,nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Bad type');
    });

    it('Undefined values throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            body: {
                username: undefined,
                password: undefined,
            }
        });

        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        StrongParamsMiddleware({username:'string',password:'string'})(request,response,nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Bad type');
    });

    it('Null values throws error', () => {
        const request = httpMocks.createRequest({
            method: 'POST',
            url: '/test',
            body: {
                username: null,
                password: null,
            }
        });

        const response = httpMocks.createResponse();

        const nextFunction = sinon.spy();

        StrongParamsMiddleware({username:'string',password:'string'})(request,response,nextFunction);

        expect(nextFunction.calledOnce);
        expect(nextFunction.getCall(0).args[0]).to.equal('Bad type');
    });
});