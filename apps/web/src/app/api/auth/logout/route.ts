import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const GET = async (request: Request) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    (await cookies()).delete("app-user");
    redirect("/auth/login");
};