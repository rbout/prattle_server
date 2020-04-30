import { Request, Response, NextFunction, RequestHandler } from "express";

export function strongParamsMiddleware(params: { [key:string]: string } ): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
        const weakParams = request.body;

        const strongParams = {};

        Object.entries(params).forEach(([key, value]) => {
            const weakParam = weakParams[key];

            if(weakParam && typeof weakParam === value) {
                strongParams[key] = weakParam;
            } else {
                return next('Bad type');
            }
        });

        response.locals.strongParams = strongParams;

        request.body = null;

        return next();
    }
}