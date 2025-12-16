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
        owner_id,
        worker_id,
        images
      `)
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
    // If no jobs, return empty list early
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Fetch owner profiles in one query to avoid N+1 requests
    const ownerIds = Array.from(new Set(jobs.map(j => j.owner_id).filter(Boolean)));
    let ownersById: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: owners, error: ownersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location, role')
        .in('id', ownerIds as string[]);
      if (ownersError) {
        console.warn('Warning: failed to fetch owner profiles:', ownersError.message);
      } else if (owners) {
        ownersById = owners.reduce((acc: Record<string, any>, o: any) => {
          acc[o.id] = o;
          return acc;
        }, {});
      }
    }

    // Get current user to check their likes
    const { data: { user } } = await supabase.auth.getUser();

    // Get likes counts for all jobs
    const jobIds = jobs.map(j => j.id);
    const { data: likesData } = await supabase
      .from('job_likes')
      .select('job_id, user_id')
      .in('job_id', jobIds);

    // Get comments counts for all jobs
    const { data: commentsData } = await supabase
      .from('job_comments')
      .select('job_id')
      .in('job_id', jobIds);

    // Build counts maps
    const likesCounts: Record<string, number> = {};
    const userLikes: Set<string> = new Set();
    (likesData || []).forEach((like: any) => {
      likesCounts[like.job_id] = (likesCounts[like.job_id] || 0) + 1;
      if (user && like.user_id === user.id) {
        userLikes.add(like.job_id);
      }
    });

    const commentsCounts: Record<string, number> = {};
    (commentsData || []).forEach((comment: any) => {
      commentsCounts[comment.job_id] = (commentsCounts[comment.job_id] || 0) + 1;
    });

    // Format the data for the frontend, including poster (owner) details
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
      owner_id: job.owner_id,
      worker_id: job.worker_id,
      status: job.status || 'open',
      owner: ownersById[job.owner_id as string] || null,
      likesCount: likesCounts[job.id] || 0,
      commentsCount: commentsCounts[job.id] || 0,
      userLiked: userLikes.has(job.id),
      // Ensure arrays exist to avoid UI runtime errors
      applications: [],
      conversations: []
    }));

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