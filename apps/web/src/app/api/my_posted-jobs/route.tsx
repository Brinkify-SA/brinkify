import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        id,
        created_at,
        user_id,

        customers:customers!user_id(
          id,
          first_name,
          last_name
        ),

        job_images(url),

        job_reviews(rating)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = jobs.map(j => {
      const reviewerAvg =
        j.job_reviews && j.job_reviews.length > 0
          ? (j.job_reviews.reduce((sum, r) => sum + r.rating, 0) / j.job_reviews.length).toFixed(1)
          : "No Reviews";

      return {
        id: j.id,
        created_at: j.created_at,
        //job creator home owner info
        customer: j.customers && j.customers.length > 0 ? {
          id: j.customers[0].id,
          name: `${j.customers[0].first_name} ${j.customers[0].last_name}`,
        } : null,

        images: j.job_images?.map(i => i.url) ?? [],
        rating: reviewerAvg
      };
    });

    return Response.json(formatted);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
