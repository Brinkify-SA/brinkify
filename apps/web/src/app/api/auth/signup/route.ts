import { encodeBase64 } from "@/utils/base64";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
    const supabase = await createClient();
    const data = await request.json();
    const { email, password, name, role } = data;
    const [first_name, last_name] = name.split(" ");

    if(!email || !password || !first_name || !last_name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const { data: user, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    })
    if (error) {
        return new Response(JSON.stringify({ error: error.message, lcl: "auth", user }), { status: 400 });
    }
    const { data: userProfile, error: profileError } = await supabase.from("users").insert({
        id: user.user?.id,
        first_name,
        last_name,
        email,
    }).select("*, workers(*), companies(*), customers(*), subscriptions(*), addresses(*)").single();

    if (profileError) {
        return new Response(JSON.stringify({ error: profileError.message, lcl: "profile" }), { status: 400 });
    }

    let roleError;
    switch (role.toLowerCase()) {
        case "worker":
            const { error: workerError } = await supabase.from("workers").insert({
                user_id: user.user?.id,
            });
            roleError = workerError;
            break;
        case "customer":
            const { error: ownerError } = await supabase.from("customers").insert({
                user_id: user.user?.id,
            });
            roleError = ownerError;
            break;
        case "company":
            const { error: companyError } = await supabase.from("companies").insert({
                user_id: user.user?.id,
                email: email,
            });
            roleError = companyError;
            break;
        default:
            return new Response(JSON.stringify({ error: "Invalid role specified", lcl: "role" }), { status: 400 });
    }

    if (roleError) {
        return new Response(JSON.stringify({ error: roleError.message, lcl: "role_insert" }), { status: 400 });
    }


    //set the role of the user
    userProfile.role = role;

    //encode user and save to cookies, will be used in the onboarding...
    const encodedProfile = encodeBase64(JSON.stringify(userProfile));
    (await cookies()).set("app-user", encodedProfile, { path: '/' });

    //sign the user out so to prevent them from accessing the dashboard, and continue to onboarding
    await supabase.auth.signOut();
    
    return new Response(JSON.stringify({ message: "Account created successfully", data: userProfile }), { status: 200 });

}