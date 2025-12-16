import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

/**
 * GET - Get all comments for a job
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const supabase = await createClient();
    const params = await Promise.resolve(context.params);
    const jobId = params.id;

    const { data: comments, error } = await supabase
      .from("job_comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ data: comments || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

/**
 * POST - Add a new comment
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
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Comment content is required" }),
        { status: 400 }
      );
    }

    const { data: newComment, error } = await supabase
      .from("job_comments")
      .insert({
        job_id: jobId,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ data: newComment }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a comment
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { commentId } = await request.json();

    if (!commentId) {
      return new Response(
        JSON.stringify({ error: "Comment ID is required" }),
        { status: 400 }
      );
    }

    // Delete only if user owns the comment
    const { error } = await supabase
      .from("job_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Comment deleted" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
