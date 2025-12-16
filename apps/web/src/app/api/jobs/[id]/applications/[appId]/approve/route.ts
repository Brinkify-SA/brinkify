// app/api/jobs/[id]/applications/approve/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: any) {
  const supabase = await createClient();
  const body = await request.json().catch(() => ({}));
  let params = context?.params;
  if (params && typeof params.then === "function") {
    params = await params;
  }
  const { id, appId } = (params || {}) as { id: string; appId?: string };
  const applicationId = body.applicationId || appId;

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user owns the job
  const { data: job } = await supabase
    .from("jobs")
    .select("id, owner_id")
    .eq("id", id)
    .single();

  if (!job || job.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get application + worker (user_id)
  const { data: application } = await supabase
    .from("job_applications")
    .select("user_id")
    .eq("id", applicationId)
    .eq("job_id", id)
    .single();

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Approve application
  const { error: updateAppError } = await supabase
    .from("job_applications")
    .update({ status: "approved" })
    .eq("id", applicationId);

  if (updateAppError) {
    return NextResponse.json({ error: updateAppError.message }, { status: 500 });
  }

  // ✅ ASSIGN WORKER TO JOB
  const { error: updateJobError } = await supabase
    .from("jobs")
    .update({
      worker_id: application.user_id,
      status: "assigned"
    })
    .eq("id", id);

  if (updateJobError) {
    console.error("Failed to assign worker:", updateJobError);
    return NextResponse.json({ error: "Failed to assign worker" }, { status: 500 });
  }

  // (Optional) Reject other applications
  await supabase
    .from("job_applications")
    .update({ status: "rejected" })
    .eq("job_id", id)
    .neq("id", applicationId)
    .is("status", null) // assuming pending = null or 'pending'
    .or("status.eq.pending");

  return NextResponse.json({ success: true });
}