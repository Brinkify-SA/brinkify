import { decodeBase64 } from "@/utils/base64Utils";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

  //Defining the type for the form data
interface OnboardingFormData {
  id: string;
  email: string;
  role: "worker" | "customer" | "company";
  avatar_url: string;
  address: {
    country: string;
    province: string;
    city: string;
    street_number: string;
    street_name: string;
    postal_code: string;
  };
  skills?: string[];
  bio?: string;
  company_name?: string;
  tax_number?: string;
}

export async function POST(request: Request) {
  const encodedProfile = (await cookies()).get("app-user")?.value;
  if (!encodedProfile) {
    return new Response(JSON.stringify({ error: "User session not found" }), { status: 401 });
  }
  const user = JSON.parse(decodeBase64(encodedProfile)); 
  const data: OnboardingFormData = await request.json();

  const supabase = await createClient();
  const userId = user.id;

  //Update the auth users table
  const { error: userError } = await supabase
    .from("users")
    .update({
      avatar_url: data.avatar_url || null,
      role: data.role,
    })
    .eq("id", userId);

  if (userError) {
    return new Response(
      JSON.stringify({ error: userError.message, lcl: "user_update" }),
      { status: 400 }
    );
  }

  const { error: delAddrError } = await supabase
    .from("addresses")
    .delete()
    .eq("user_id", userId);

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
    const { error: workerError } = await supabase.from("workers").insert({
      user_id: userId,
      skills: data.skills || [],
      bio: data.bio || "",
      avatar_url: data.avatar_url || null,
    });
    roleError = workerError;
  } else if (data.role === "company") {
    const { error: companyError } = await supabase.from("companies").insert({
      user_id: userId,
      company_name: data.company_name || "",
      tax_number: data.tax_number || "",
      avatar_url: data.avatar_url || null,
    });
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