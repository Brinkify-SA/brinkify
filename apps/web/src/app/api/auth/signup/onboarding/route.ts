/**
 * Get the onboarding form data from the request body and store it in the database
 * For all roles, you will need address, it is not optional
 * address: {
      country: string,
      province: string,
      city: string,
      street_number: string,
      street_name: string,
      postal_code: string,
    },
    This will be stored in the addresses table, foreign key is using user_id
    user_id == user.id from the cookie
 */

import { decodeBase64 } from "@/utils/base64Utils";
import { cookies } from "next/headers";




export async function POST(request: Request) {
  const encodedProfile = (await cookies()).get("app-user")?.value;//get the user from the cookie
  const user = decodeBase64(encodedProfile!);//decode the user from the cookie
  const data = await request.json();
  console.log(data);//this is the onboarding form data
  return new Response(JSON.stringify({ data, user }), { status: 200 });
}