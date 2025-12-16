// app/api/jobs/[id]/complete/route.ts
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

  // Verify user is the assigned worker
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("worker_id, owner_id")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Allow either the assigned worker OR the job owner to mark complete
  if (job.worker_id !== user.id && job.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Mark job as completed
  const { error: updateError } = await supabase
    .from("jobs")
    .update({ status: "completed" })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to complete job:", updateError);
    return NextResponse.json({ error: "Failed to update job status" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}