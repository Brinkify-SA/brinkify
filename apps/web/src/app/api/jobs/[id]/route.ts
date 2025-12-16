// app/api/jobs/[id]/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      owner:users!owner_id(id, email),
      worker:users!worker_id(id, email)
    `)
    .eq("id", id)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function PATCH(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  const body = await request.json().catch(() => ({}));
  const fields: any = {};
  const allowed = [
    'title',
    'description',
    'category',
    'location',
    'min_budget',
    'max_budget',
    'images',
  ];
  for (const k of allowed) {
    if (k in body) fields[k] = body[k];
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('owner_id')
    .eq('id', id)
    .single();
  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  if (job.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from('jobs')
    .update(fields)
    .eq('id', id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('owner_id')
    .eq('id', id)
    .single();
  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  if (job.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error: delError } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}