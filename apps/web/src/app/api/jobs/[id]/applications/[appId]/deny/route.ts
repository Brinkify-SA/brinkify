import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { applicationId } = await request.json();

  if (!applicationId) {
    return NextResponse.json(
      { error: "applicationId required" },
      { status: 400 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("owner_id")
    .eq("id", params.id)
    .single();

  if (!job || job.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("job_applications")
    .update({ status: "denied" })
    .eq("id", applicationId)
    .eq("job_id", params.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
