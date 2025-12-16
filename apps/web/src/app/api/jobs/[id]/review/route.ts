// app/api/jobs/[id]/review/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Verify the job exists and user is the owner
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, owner_id, status')
      .eq('id', id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.owner_id !== user.id) {
      return NextResponse.json({ error: "Only the job owner can leave a review" }, { status: 403 });
    }

    if (job.status !== 'completed') {
      return NextResponse.json({ error: "Can only review completed jobs" }, { status: 400 });
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('job_reviews')
      .select('id')
      .eq('job_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this job" }, { status: 400 });
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from('job_reviews')
      .insert({
        id: crypto.randomUUID(),
        job_id: id,
        user_id: user.id,
        rating: rating,
        comment: comment || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error in review POST:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}

// GET existing review for a job
export async function GET(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: review, error } = await supabase
    .from('job_reviews')
    .select('*')
    .eq('job_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review });
}
