// app/api/user/stats/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'worker';

    if (role === 'worker') {
      // Worker stats
      const [jobsResult, earningsResult] = await Promise.all([
        // Active jobs (assigned to worker and not completed)
        supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('worker_id', user.id)
          .in('status', ['assigned', 'in-progress']),
        
        // Total earnings from completed jobs
        supabase
          .from('jobs')
          .select('id, max_budget')
          .eq('worker_id', user.id)
          .eq('status', 'completed')
      ]);

      const activeJobs = jobsResult.count || 0;
      const totalEarnings = earningsResult.data?.reduce((sum, job) => sum + (job.max_budget || 0), 0) || 0;
      
      // Get reviews for completed jobs
      let avgRating = 0;
      if (earningsResult.data && earningsResult.data.length > 0) {
        const completedJobIds = earningsResult.data.map(j => j.id);
        const { data: reviews } = await supabase
          .from('job_reviews')
          .select('rating')
          .in('job_id', completedJobIds);
        
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          avgRating = totalRating / reviews.length;
        }
      }

      return NextResponse.json({
        role: 'worker',
        activeJobs,
        totalEarnings,
        avgRating: avgRating.toFixed(1),
        totalJobs: (earningsResult.data?.length || 0) + activeJobs
      });

    } else if (role === 'customer') {
      // Customer stats
      const [jobsResult, spentResult, allJobsResult] = await Promise.all([
        // Active jobs posted by customer
        supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .in('status', ['open', 'assigned', 'in-progress']),
        
        // Total spent on completed jobs
        supabase
          .from('jobs')
          .select('max_budget')
          .eq('owner_id', user.id)
          .eq('status', 'completed'),
        
        // Get all job IDs for this customer
        supabase
          .from('jobs')
          .select('id')
          .eq('owner_id', user.id)
      ]);

      const activeJobs = jobsResult.count || 0;
      const totalSpent = spentResult.data?.reduce((sum, job) => sum + (job.max_budget || 0), 0) || 0;
      
      // Now fetch applicants for all user's jobs
      let totalApplicants = 0;
      if (allJobsResult.data && allJobsResult.data.length > 0) {
        const jobIds = allJobsResult.data.map(j => j.id);
        const { count } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds);
        totalApplicants = count || 0;
      }

      return NextResponse.json({
        role: 'customer',
        activeJobs,
        totalSpent,
        totalApplicants,
        totalJobs: (spentResult.data?.length || 0) + activeJobs
      });

    } else {
      // Company stats
      const projectsResult = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .in('status', ['assigned', 'in-progress']);

      const activeProjects = projectsResult.count || 0;

      // Try to get team size, but don't fail if table doesn't exist
      let teamSize = 0;
      try {
        const teamResult = await supabase
          .from('company_members')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', user.id);
        teamSize = teamResult.count || 0;
      } catch (e) {
        console.log('company_members table not found, defaulting team size to 0');
      }

      return NextResponse.json({
        role: 'company',
        activeProjects,
        teamSize,
        totalProjects: activeProjects
      });
    }
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
