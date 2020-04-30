export const checkIfEmpty = (request, response, next) => {
    const {username, email, password} = request.body;
    if(username !== '' && email !== '' && password !== '') {
        return next();
    } else {
        response.sendStatus(400);
        return next(new Error("Register fields can't be empty"));
    }
};