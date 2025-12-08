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
        budget_min,
        budget_max,
        created_at,
        status,
        user_id,
        job_images (image_url),
        users (id, full_name, avatar_url)
      `)
      .eq('status', 'active')
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
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      budget_min: job.budget_min,
      budget_max: job.budget_max,
      created_at: job.created_at,
      images: job.job_images || [],
      user: {
        id: job.users?.[0]?.id || job.user_id,
        full_name: job.users?.[0]?.full_name || 'Anonymous',
        avatar_url: job.users?.[0]?.avatar_url || '/default-avatar.png'
      }
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