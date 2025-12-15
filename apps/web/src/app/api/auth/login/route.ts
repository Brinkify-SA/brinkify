import { setServerCookie } from "@/utils/server/cookies";
import { createClient } from "@/utils/supabase/server";
import moment from 'moment'


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
    
const { data: userProfile, error: profileError } = await supabase
  .from("users")
  .select(`
    *,
    workers(*),
    companies(*),
    customers(*),
    subscriptions(
      *,
      subscription_plans(name, user_type, price)
    ),
    addresses(*)
  `)
  .eq("id", user.user?.id)
  .single();
    
    if (profileError) {
        return new Response(JSON.stringify({ error: "Unexpected Error occured", msg: profileError.message, lcl: "profile_fetch" }), { status: 400 });
    }

    if (userProfile.workers) {
        userProfile.role = "worker";
    } else if (userProfile.companies) {
        userProfile.role = "company";
    } else if (userProfile.customers) {
        userProfile.role = "customer";
    } else {
        return new Response(JSON.stringify({ error: "User profile not found", lcl: "profile_fetch", userProfile }), { status: 400 });
    }

    //if no subscription plan, initialize a free trial plan
    if (!userProfile.subscriptions && userProfile.role !== "customer") {
        const { data: plan, error } = await supabase.from("subscription_plans").select().eq("user_type", userProfile.role).eq("price", 0).single();
        const { data: subscription, error: planError } = await supabase.from("subscriptions").insert({ plan_id: plan?.id, user_id: userProfile.id, start_date: moment(), end_date: moment().add(14, "days"), active: true }).select('*, subscription_plans(name, user_type, price)').single();

        if(planError || error) {
            return new Response(JSON.stringify({ error: "Unexpected Error occured", msg: planError?.message || error?.message }), { status: 400 });
        }

        userProfile.subscriptions = subscription;
    }

    userProfile.plan = userProfile.subscriptions?.subscription_plans;
    delete userProfile.subscription;
    //encode profile and save to cookies
    await setServerCookie("app-user", userProfile);


    //check if they already have address filled in, can only be done in onboarding
    //log them out, then redirect them to onboarding
    if (!userProfile.addresses?.length) {
        await supabase.auth.signOut();
        return new Response(JSON.stringify({ message: "Redirecting to user onboarding", redirect: "/auth/onboarding", user: userProfile }), { status: 200 });
    }

    
    return new Response(JSON.stringify({ message: "User logged in successfully", user: userProfile }), { status: 200 });
}