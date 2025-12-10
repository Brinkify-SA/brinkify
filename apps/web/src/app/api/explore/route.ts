import { createClient } from "@/utils/supabase/server";

/**
 * GET API endpoint to fetch completed jobs for the explore page
 * Returns all jobs with status 'completed'
 */
export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Fetch completed jobs with related data
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
        status,
        customer_id,
        images,
        customers!customer_id (id, user_id, users!inner (id, email))
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    
    // Handle database error
    if (error) {
      console.error('Database error fetching completed jobs:', error);
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
      status: job.status,
      images: job.images || [],
      user: {
        id: job.customers?.[0]?.id || job.customer_id,
        full_name: job.customers?.[0]?.users?.[0]?.email?.split('@')[0] || 'Anonymous',
        avatar_url: '/default-avatar.png'
      }
    }));
    
    console.log(`Returning ${formattedJobs.length} completed jobs to explore`);
    return new Response(JSON.stringify(formattedJobs), { status: 200 });
  } catch (error) {
    console.error('Error in /api/explore:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
