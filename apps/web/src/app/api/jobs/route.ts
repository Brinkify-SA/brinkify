// app/api/jobs/route.ts
import { getServerCookie } from "@/utils/server/cookies";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const formData = await req.formData();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gate: only homeowners (customers) can post jobs
  const appUser = await getServerCookie("app-user");
  const role = appUser?.role?.toLowerCase();
  if (role !== "customer") {
    return NextResponse.json({ error: "Only homeowners can post jobs" }, { status: 403 });
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const category = formData.get("category")?.toString();
  const location = formData.get("location")?.toString(); // add if you collect it
  const minBudget = formData.get("minBudget");
  const maxBudget = formData.get("maxBudget");

  if (!title || !description || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Insert job — owner_id = authenticated user
  const { data: newJob, error: jobError } = await supabase
    .from("jobs")
    .insert({
      user_id: user.id,
      owner_id: user.id,
      title,
      description,
      category,
      location,
      min_budget: minBudget ? Number(minBudget) : null,
      max_budget: maxBudget ? Number(maxBudget) : null,
      status: "open", // 🔑 critical!
    })
    .select()
    .single();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 400 });
  }

  // Handle images (optional)
  const files = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  if (files.length > 0) {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `jobs/${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(path, buffer, { contentType: file.type });

      if (uploadError) continue;

      const { data } = supabase.storage.from("files").getPublicUrl(path);
      imageUrls.push(data.publicUrl);
    }

    await supabase
      .from("jobs")
      .update({ images: imageUrls })
      .eq("id", newJob.id);
  }

  return NextResponse.json({ success: true, data: newJob }, { status: 201 });
}

// GET: Public job board
export async function GET() {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open") // only show open jobs
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: jobs });
}