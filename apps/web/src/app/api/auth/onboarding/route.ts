import { decodeBase64 } from "@/utils/base64";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { OnboardingFormData } from "@/utils/types/OnboardingFormData";
import { getServerCookie } from "@/utils/server/cookies";

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



export async function POST(request: Request) {
  const user = await getServerCookie("app-user");
  if (!user) {
    return new Response(JSON.stringify({ error: "User session not found" }), { status: 401 });
  } 
  const data: OnboardingFormData = await request.json();

  const supabase = await createClient();
  const userId = user.id;

  const { error: addressError } = await supabase.from("addresses").insert({
    user_id: userId,
    country: data.address.country,
    province: data.address.province,
    city: data.address.city,
    street_number: data.address.street_number,
    street_name: data.address.street_name,
    postal_code: data.address.postal_code,
  });

  if (addressError) {
    return new Response(
      JSON.stringify({ error: addressError.message, lcl: "address_insert" }),
      { status: 400 }
    );
  }
//Insert user role inpute data
  let roleError = null;

  if (data.role === "worker") {
    const { error: workerError } = await supabase.from("workers").update({
      skills: data.skills || [],
      bio: data.bio || "",
    }).eq("user_id", userId);
    roleError = workerError;
  } else if (data.role === "company") {
    const { error: companyError } = await supabase.from("companies").update({
      name: data.company_name || "",
      tax_number: data.tax_number || "",
    }).eq("user_id", userId);
    roleError = companyError;
  }
 
  if (roleError) {
    return new Response(
      JSON.stringify({ error: roleError.message, lcl: "role_insert" }),
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({ message: "Onboarding completed successfully" }),
    { status: 200 }
  );
}