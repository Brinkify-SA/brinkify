// app/api/jobs/[id]/applications/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  const { data: applications, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", id);

  if (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch user profiles for each application
  if (applications && applications.length > 0) {
    const userIds = applications.map(app => app.user_id).filter(Boolean);
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);
      
      // Attach profile to each application
      const enrichedApps = applications.map(app => ({
        ...app,
        profiles: profiles?.find(p => p.id === app.user_id) || null
      }));
      return NextResponse.json({ applications: enrichedApps });
    }
  }

  return NextResponse.json({ applications: applications || [] });
}

export async function POST(request: NextRequest, context: any) {
  const supabase = await createClient();
  let params = context?.params;
  if (params && typeof params.then === 'function') {
    params = await params;
  }
  const { id } = (params || {}) as { id: string };

  console.log('Applications POST: job_id =', id);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Applications POST: auth error', authError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log('Applications POST: user_id =', user.id);

  // Check if user already applied
  const { data: existing, error: existErr } = await supabase
    .from('job_applications')
    .select('id, status')
    .eq('job_id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (existErr) {
    console.warn('applications POST: precheck failed', existErr.message);
  }
  
  if (existing && existing.status !== 'denied') {
    console.log('Applications POST: already applied');
    return NextResponse.json({ error: 'Already applied' }, { status: 400 });
  }

  // Insert new application with UUID
  const insertData: any = { 
    id: crypto.randomUUID(),
    job_id: id, 
    user_id: user.id, 
    status: 'pending'
  };

  console.log('Applications POST: inserting', insertData);

  const { data: newApp, error } = await supabase
    .from('job_applications')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error inserting job application:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 500 });
  }

  console.log('Applications POST: success', newApp?.id);
  return NextResponse.json({ success: true, application: newApp });
}