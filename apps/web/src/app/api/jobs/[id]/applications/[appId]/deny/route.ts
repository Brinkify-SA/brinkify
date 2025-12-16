// app/api/jobs/[id]/applications/deny/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, context: any) {
  const supabase = await createClient();
  const body = await request.json().catch(() => ({}));
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id, appId } = (params || {}) as { id: string; appId?: string };
  const applicationId = body.applicationId || appId;

  // ✅ Validate input
  if (!applicationId) {
    return NextResponse.json(
      { error: "applicationId is required" },
      { status: 400 }
    );
  }

  // ✅ Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ Verify user owns the job
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, owner_id, status")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }

  if (job.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Forbidden: You do not own this job" },
      { status: 403 }
    );
  }

  // ✅ Verify the application exists and belongs to this job
  const { data: application, error: appError } = await supabase
    .from("job_applications")
    .select("id, job_id, user_id")
    .eq("id", applicationId)
    .eq("job_id", id)
    .single();

  if (appError || !application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  // ✅ Update application status to "denied"
  const { error: updateError } = await supabase
    .from("job_applications")
    .update({ status: "denied" })
    .eq("id", applicationId);

  if (updateError) {
    console.error("Failed to deny application:", updateError);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }

  // 🔄 Optional: Ensure job stays 'open' if no worker is assigned
  // (Only if job hasn't been assigned yet)
  if (job.status === "open") {
    // Count approved applications (in case another was approved)
    const { count, error: countError } = await supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .eq("job_id", id)
      .eq("status", "approved");

    if (!countError && (count || 0) === 0) {
      // Still no approved worker → ensure job remains open
      // (Not strictly necessary, but safe)
      await supabase
        .from("jobs")
        .update({ status: "open" })
        .eq("id", id);
    }
  }

  return NextResponse.json({ success: true });
}