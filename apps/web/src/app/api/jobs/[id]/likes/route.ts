import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

/**
 * GET - Get likes count and user's like status for a job
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const params = await Promise.resolve(context.params);
    const jobId = params.id;

    // Get total likes count
    const { count, error: countError } = await supabase
      .from("job_likes")
      .select("*", { count: "exact", head: true })
      .eq("job_id", jobId);

    if (countError) {
      return new Response(
        JSON.stringify({ error: countError.message }),
        { status: 500 }
      );
    }

    // Check if current user has liked (if authenticated)
    let userLiked = false;
    if (user) {
      const { data: userLike } = await supabase
        .from("job_likes")
        .select("id")
        .eq("job_id", jobId)
        .eq("user_id", user.id)
        .single();
      
      userLiked = !!userLike;
    }

    return new Response(
      JSON.stringify({ count: count || 0, userLiked }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching likes:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

/**
 * POST - Toggle like (add or remove)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const params = await Promise.resolve(context.params);
    const jobId = params.id;

    // Check if user already liked this job (don't use .single() as it throws if not found)
    const { data: existingLikes, error: checkError } = await supabase
      .from("job_likes")
      .select("id")
      .eq("job_id", jobId)
      .eq("user_id", user.id)
      .limit(1);

    if (checkError) {
      console.error("Error checking existing like:", checkError);
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { status: 500 }
      );
    }

    const existingLike = existingLikes && existingLikes.length > 0 ? existingLikes[0] : null;

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from("job_likes")
        .delete()
        .eq("job_id", jobId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting like:", deleteError);
        return new Response(
          JSON.stringify({ error: deleteError.message }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ liked: false, message: "Like removed" }),
        { status: 200 }
      );
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from("job_likes")
        .insert({
          job_id: jobId,
          user_id: user.id,
        });

      if (insertError) {
        console.error("Error inserting like:", insertError);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ liked: true, message: "Job liked" }),
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
