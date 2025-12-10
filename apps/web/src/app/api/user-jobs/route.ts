import { createClient } from "@/utils/supabase/server";

/**
 * GET API endpoint to fetch user's posted jobs (for customers)
 * Returns jobs where the authenticated user is the customer
 */
export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "User not authenticated" }),
        { status: 401 }
      );
    }

    // Get customer record for this user
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (customerError || !customers) {
      // User is not a customer, return empty array
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Fetch jobs posted by this customer
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        category,
        location,
        min_budget,
        max_budget,
        created_at,
        open,
        status,
        customer_id,
        images,
        customers!customer_id (id, user_id, users!inner (id, email))
      `)
      .eq('customer_id', customers.id)
      .order('created_at', { ascending: false });

    // Handle database error
    if (error) {
      console.error('Database error fetching user jobs:', error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs", details: error.message }),
        { status: 500 }
      );
    }

    // Format the data for the frontend
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      min_budget: job.min_budget,
      max_budget: job.max_budget,
      created_at: job.created_at,
      open: job.open,
      status: job.status,
      images: job.images || [],
      customer_id: job.customer_id,
      user: {
        id: job.customers?.[0]?.id || job.customer_id,
        full_name: job.customers?.[0]?.users?.[0]?.email?.split('@')[0] || 'Anonymous',
        avatar_url: '/default-avatar.png'
      }
    }));

    console.log(`Returning ${formattedJobs.length} user jobs`);
    return new Response(JSON.stringify(formattedJobs), { status: 200 });
  } catch (error) {
    console.error('Error in /api/user-jobs:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
