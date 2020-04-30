import { Request, Response, NextFunction} from "express";

export function userCookieMiddleware(request: Request, response: Response, next: NextFunction) {
    if(request.signedCookies?.sessionID && request.signedCookies.sessionID.length === 64 &&
    !request.signedCookies.sessionID.includes(' ') && !request.signedCookies.sessionID.match(/^[A-Za-z]+$/)
    && !/^\d+$/.test(request.signedCookies.sessionID)) {
        const sessionID: string = request.signedCookies.sessionID;
        response.locals.sessionID = sessionID;
        return next();
    } else {
        response.sendStatus(403);
        return next('Cookie was required for request but no cookie was found');
    }
}