import { createClient } from "@/utils/supabase/server";  

export const POST = async (req: Request) => {

  const supabase = await createClient();
  const body = await req.json();
  
  // Get the authenticated user from Supabase Auth
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 });
  }

  //Validate required fields before storing
  if (!body.title || !body.description || !body.category || !body.location) {
    return new Response(
      JSON.stringify({ message: "Missing required job fields." }),
      { status: 400 }
    );
  }

  // Ensure customer exists using service role (bypass RLS)
  const serviceSupabase = await createClient();
  
  // Check if customer exists
  const { data: customerExists } = await serviceSupabase
    .from("customers")
    .select("id", { count: "exact" })
    .eq("user_id", authUser.id)
    .single();

  if (!customerExists) {
    // Insert customer with service role to bypass RLS
    const { error: customerError } = await serviceSupabase
      .from("customers")
      .insert({
        user_id: authUser.id,
      });

    if (customerError) {
      console.log("Customer creation failed:", customerError);
      return new Response(JSON.stringify({ error: "Failed to create customer record" }), { status: 400 });
    }
  }

  // Get the customer ID for this user
  const { data: customer } = await serviceSupabase
    .from("customers")
    .select("id")
    .eq("user_id", authUser.id)
    .single();

  if (!customer) {
    return new Response(JSON.stringify({ error: "Failed to retrieve customer ID" }), { status: 400 });
  }

  //Store Jobs data
  const { data: newJob, error: jobError } = await supabase
    .from("jobs")                            
    .insert({
      customer_id: customer.id,                   
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      min_budget: body.minBudget || null,
      max_budget: body.maxBudget || null,
      images: body.images && body.images.length > 0 ? body.images : null,
      created_at: new Date().toISOString()   
    })
    .select("*")                              
    .single();

  if (jobError) {
    console.log("Job insertion failed:", jobError);
    return new Response(JSON.stringify({ error: jobError.message }), { status: 400 });
  }

  //Store uploaded images
  // Images are stored on the `jobs.images` column (TEXT[]). No separate table in schema.

  return new Response(
    JSON.stringify({ success: true, jobId: newJob.id }),
    { status: 200 }
  );
};
