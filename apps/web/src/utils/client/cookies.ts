import { decodeBase64 } from "../base64";


/**
 * Retrieves a value from a cookie by name.
 * 
 * @param {string} cookieName Name of the cookie to retrieve.
 * @returns {object|null} The value of the cookie if found, otherwise null.
 * 
 * If the cookie does not exist, returns null.
 * If the cookie exists but is not a valid JSON object, returns null.
 * If the cookie exists and is a valid JSON object, returns the parsed JSON object.
 */
export const getClientCookie = (key: string) => {

    if(!document?.cookie) throw new Error("Must be called from Client Only: No cookies found\nLine 16 in apps/web/src/utils/client/cookies.ts");
    let cookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith(key+"="))
        ?.split("=")[1];
    if (!cookie) return null;
    
    let decodedCookie = decodeBase64(cookie!);
    //parse the string to make sure it is an object that will be able to parsed by JSON.parse
    if (!decodedCookie.endsWith('}')) {
        //make sure it starts with { and ends with }, by substringing the string from the first { to the last }
        decodedCookie = decodedCookie.substring(decodedCookie.indexOf('{'), decodedCookie.lastIndexOf('}') + 1);
    }

    return cookie ? JSON.parse(decodedCookie) : null;
}

export const setClientCookie = (key: string, value: any) => {
    
}