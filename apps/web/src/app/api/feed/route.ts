import { createClient } from "@/utils/supabase/server";

/**
 * GET API endpoint to fetch jobs for the feed page
 * Returns all active jobs with their images and user information
 */
export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Fetch jobs with related data
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
        images
      `)
      // Fetch open jobs
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    // Handle database error
    if (error) {
      console.error('Database error fetching jobs:', error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch jobs", details: error.message }),
        { status: 500 }
      );
    }
    
    // Format the data for the frontend
    const formattedJobs = (jobs || []).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      min_budget: job.min_budget,
      max_budget: job.max_budget,
      created_at: job.created_at,
      images: job.images || [],
      customer_id: job.customer_id,
      status: 'open'
    }));
    
    console.log(`Returning ${formattedJobs.length} jobs to feed`);
    
    return new Response(JSON.stringify(formattedJobs), { status: 200 });
  } catch (error) {
    console.error("Unexpected error in feed API:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}