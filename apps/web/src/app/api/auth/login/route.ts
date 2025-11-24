import { encodeBase64 } from "@/utils/base64Utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
    const supabase = await createClient();
    const data = await request.json();
    const { email, password } = data;

    if(!email || !password) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    // Validate input
    if (!/\S+@\S+\.\S+/.test(email)) {
        return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
    }
    //
    if(!(password?.length > 6)) {
        return new Response(JSON.stringify({ error: "Password Must be at least 6 characters" }), { status: 400 });
    }
    const { data: user, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return new Response(JSON.stringify({ error: error.message, user, lcl: "auth" }), { status: 400 });
    }
    
    const {data: userProfile, error: profileError} = await supabase.from("users").select("*, workers(*), companies(*), customers(*)").eq("id", user.user?.id).single();
    
    if (profileError) {
        return new Response(JSON.stringify({ error: "Unexpected Error occured", lcl: "profile_fetch" }), { status: 400 });
    }

    if (userProfile.workers?.id) {
        userProfile.role = "worker";
    } else if (userProfile.companies?.id) {
        userProfile.role = "company";
    } else if (userProfile.customers?.id) {
        userProfile.role = "customer";
    } else {
        return new Response(JSON.stringify({ error: "User profile not found", lcl: "profile_fetch" }), { status: 400 });
    }

    const encodedProfile = encodeBase64(JSON.stringify(userProfile));
    (await cookies()).set("app-user", encodedProfile, { httpOnly: true, path: '/' });
    return new Response(JSON.stringify({ message: "User logged in successfully", user: userProfile }), { status: 200 });
}