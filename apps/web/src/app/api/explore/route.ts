import { createClient } from "@/utils/supabase/server";

/**
 * GET API endpoint to fetch completed jobs for the explore page
 * Returns all jobs with status 'completed'
 */
export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();
    
    // Fetch completed jobs
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

    // If no jobs, return empty list early
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Fetch owner and worker profiles
    const userIds = Array.from(new Set([
      ...jobs.map(j => j.owner_id).filter(Boolean),
      ...jobs.map(j => j.worker_id).filter(Boolean)
    ]));
    
    let usersById: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location, role')
        .in('id', userIds as string[]);
      if (usersError) {
        console.warn('Warning: failed to fetch user profiles:', usersError.message);
      } else if (users) {
        usersById = users.reduce((acc: Record<string, any>, u: any) => {
          acc[u.id] = u;
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
      status: job.status,
      owner_id: job.owner_id,
      worker_id: job.worker_id,
      images: job.images || [],
      owner: usersById[job.owner_id as string] || null,
      worker: usersById[job.worker_id as string] || null,
      likesCount: likesCounts[job.id] || 0,
      commentsCount: commentsCounts[job.id] || 0,
      userLiked: userLikes.has(job.id),
      applications: [],
      conversations: []
    }));

    return new Response(JSON.stringify(formattedJobs), { status: 200 });
  } catch (error) {
    console.error('Error in /api/explore:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
