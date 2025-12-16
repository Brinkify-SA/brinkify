// app/api/user-jobs/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // ✅ Step 1: Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // ✅ Helper to fetch jobs with consistent shape
  const fetchJobs = async (filters: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, description, location, min_budget, max_budget, created_at, status, owner_id, worker_id, images"
      )
      .match(filters);

    if (error) {
      console.error("Error fetching jobs", error);
      return [];
    }
    return data || [];
  };

  try {
    // 1. Jobs the user posted (as customer)
    const postedJobs = await fetchJobs({ owner_id: userId });

    // 2. Jobs the user is assigned to (as worker)
    const assignedJobs = await fetchJobs({ worker_id: userId });

    // 3. Jobs the user applied to (but not yet assigned)
    const { data: appliedData, error: appliedError } = await supabase
      .from("job_applications")
      .select(
        "jobs!inner(id, title, description, location, min_budget, max_budget, created_at, status, owner_id, worker_id, images)"
      )
      .eq("user_id", userId)
      .eq("jobs.status", "open");

    if (appliedError) {
      console.error("Error fetching applied jobs:", appliedError);
    }

    const appliedJobs = (appliedData || []).map((item: any) => item.jobs);

    // 🔁 Merge all jobs and deduplicate by ID
    const jobMap = new Map<string, any>();
    for (const job of [...postedJobs, ...assignedJobs, ...appliedJobs]) {
      if (job && job.id) {
        jobMap.set(job.id, job);
      }
    }

    let allJobs = Array.from(jobMap.values());

    // 🔎 If user is owner, enrich their posted jobs with applications + applicant profiles
    if (postedJobs.length > 0) {
      const postedIds = postedJobs.map((j: any) => j.id).filter(Boolean);
      if (postedIds.length > 0) {
        // Fetch applications
        const { data: apps, error: appsError } = await supabase
          .from("job_applications")
          .select("id, job_id, user_id, status")
          .in("job_id", postedIds);

        if (appsError) {
          console.warn("Warning: failed to fetch applications for posted jobs", appsError.message);
        }

        // Fetch profiles for all applicants
        let enrichedApps = apps || [];
        if (apps && apps.length > 0) {
          const userIds = apps.map(a => a.user_id).filter(Boolean);
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds);
            
            // Attach profile to each application
            enrichedApps = apps.map(app => ({
              ...app,
              worker_id: app.user_id,
              profiles: profiles?.find(p => p.id === app.user_id) || null
            }));
          }
        }

        const appsByJob: Record<string, any[]> = {};
        enrichedApps.forEach((a: any) => {
          const jid = a.job_id;
          if (!appsByJob[jid]) appsByJob[jid] = [];
          appsByJob[jid].push({
            id: a.id,
            worker_id: a.worker_id,
            status: a.status || "pending",
            profiles: a.profiles || null,
          });
        });

        allJobs = allJobs.map((j: any) =>
          postedIds.includes(j.id) ? { ...j, applications: appsByJob[j.id] || [] } : j
        );
      }
    }

    return NextResponse.json(allJobs);
  } catch (error: any) {
    console.error("Unexpected error in /api/user-jobs:", error);
    return NextResponse.json(
      { error: "Failed to load jobs" },
      { status: 500 }
    );
  }
}