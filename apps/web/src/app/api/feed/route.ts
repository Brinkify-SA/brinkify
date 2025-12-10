import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        category,
        location,
        min_price,
        max_price,
        open,
        created_at,
        customers (
          id,
          user_id,
          users (
            id,
            first_name,
            last_name,
          )
        ),
        job_images (
          id,
          url
        )
      `)
      .eq("open", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching feed:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const feed = (jobs || []).map((job: any) => {
      // Extract profile data through the relationship chain
      const customerData = job.customers?.[0];
      const userData = customerData?.users?.[0];
      //const profileData = userData?.profiles?.[0]; Ignored for now beacuse profile is not functional yet on my side
      
      // Safe extraction of images
      const images = Array.isArray(job.job_images)
        ? job.job_images.map((img: any) => img.url).filter(Boolean)
        : [];

      // Format price display
      let priceDisplay = "Negotiable";
      if (job.min_price !== null && job.max_price !== null) {
        priceDisplay = `R${job.min_price} - R${job.max_price}`;
      } else if (job.min_price !== null) {
        priceDisplay = `R${job.min_price}`;
      }

      return {
        id: job.id,
        title: job.title ?? "Untitled",
        description: job.description ?? "",
        category: job.category ?? "",
        location: job.location ?? "",
        price: priceDisplay,
        createdAt: job.created_at,
        //verified: Boolean(profileData),
        images,
        
    
        likes: 0,
        comments: 0,
        saves: 0,
        views: 0,
        tags: [],
        
        //customer or home owner data with fallbacks
        customer: userData
          ? {
              id: userData.id,
              name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim() || "Customer",
            }
          : {
              id: "unknown",
              name: "Anonymous",
            },
      };
    });

    return Response.json(feed);
  } catch (err: any) {
    console.error("Unexpected error in /api/feed:", err);
    return Response.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}