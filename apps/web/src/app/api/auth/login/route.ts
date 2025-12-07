import { encodeBase64 } from "@/utils/base64Utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

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
    
    const {data: userProfile, error: profileError} = await supabase.from("users").select("*, workers(*), companies(*), customers(*), subscriptions(*), trials(*), addresses(*)").eq("id", user.user?.id).single();
    
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

    //encode profile and save to cookies
    const encodedProfile = encodeBase64(JSON.stringify(userProfile));
    (await cookies()).set("app-user", encodedProfile, { path: '/' });


    //check if they already have address filled in, can only be done in onboarding
    //log them out, then redirect them to onboarding
    if (!userProfile.addresses?.length) {
        await supabase.auth.signOut();
        return new Response(JSON.stringify({ message: "Redirecting to user onboarding", redirect: "/auth/onboarding", user: userProfile }), { status: 200 });
    }

    
    return new Response(JSON.stringify({ message: "User logged in successfully", user: userProfile }), { status: 200 });
}