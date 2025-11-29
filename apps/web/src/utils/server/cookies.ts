import { cookies } from "next/headers";
import { decodeBase64, encodeBase64 } from "../base64";
;

export const getServerCookie = async (key: string) => {
    const encodedCookie = (await cookies()).get(key)?.value;
    if (!encodedCookie) {
        return null;
      }
    const user = JSON.parse(decodeBase64(encodedCookie)); 
    return user;
};
/**
 * Sets a cookie on the server.
 * @param {string} key - The name of the cookie.
 * @param {any} value - The value of the cookie.
 * @param {number} [maxAge] - The maximum age of the cookie in seconds. Defaults to 30 days.
 */
export const setServerCookie = async (key: string, value: Object, maxAge = 60 * 60 * 24 * 30 ) => {
    const encodedCookie = encodeBase64(JSON.stringify(value));
    (await cookies()).set(key, encodedCookie, { path: '/' , maxAge});
}