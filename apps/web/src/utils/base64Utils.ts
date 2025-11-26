
export const encodeBase64 = (data: string): string => {
    return Buffer.from(data).toString('base64');
}
export const decodeBase64 = (data: string): string => {
    return Buffer.from(data, 'base64').toString('utf-8');
}

//should only be called from the client
export const getUserFromCookies = () => {

    if(!document?.cookie) return null;
    let user = document.cookie
                .split("; ")
                .find((row) => row.startsWith("app-user="))
        ?.split("=")[1];
    if (!user) return null;
    
    let decodedUser = decodeBase64(user!);
    //parse the string to make sure it is an object that will be able to parsed by JSON.parse
    if (!decodedUser.endsWith('}')) {
        //make sure it starts with { and ends with }, by substringing the string from the first { to the last }
        decodedUser = decodedUser.substring(decodedUser.indexOf('{'), decodedUser.lastIndexOf('}') + 1);
    }

    console.log(decodedUser)

    return user ? JSON.parse(decodedUser) : null;
}