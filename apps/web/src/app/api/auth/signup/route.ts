import { createClient } from "@/utils/supabase/server";

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
    console.log("User created:", user.user);
    const { error: profileError } = await supabase.from("users").insert({
        id: user.user?.id,
        first_name,
        last_name,
        email,
    });
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

    return new Response(JSON.stringify({ message: "User created successfully" }), { status: 200 });

}