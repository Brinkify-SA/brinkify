import { createClient } from "@/utils/supabase/server";  

export const POST = async (req: Request) => {

  const supabase = await createClient();
  const formData = await req.formData();
  
  // Get the authenticated user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 });
  }

  //Validate required fields before storing
  if (!formData.get('title') || !formData.get('description') || !formData.get('category')) {
    return new Response(
      JSON.stringify({ message: "Missing required job fields." }),
      { status: 400 }
    );
  }
  
  // Check if customer exists
  const { data: customerExists } = await supabase
    .from("customers")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .single();

  if (!customerExists) {
    return new Response(JSON.stringify({ error: "Customer not found" }), { status: 400 });
  }



  //Store Jobs data
  const { data: newJob, error: jobError } = await supabase
    .from("jobs")                            
    .insert({
      user_id: user.id,                   
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      min_budget: formData.get('minBudget') || null,
      max_budget: formData.get('maxBudget') || null,
      date: formData.get('preferredDate') || null,
    })
    .select("*")                              
    .single();

  if (jobError) {
    console.log("Job insertion failed:", jobError);
    return new Response(JSON.stringify({ error: jobError.message }), { status: 400 });
  }

  const files = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const ext = file.name.split(".").pop();
      const path = `jobs/${crypto.randomUUID()}.${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from("files")
        .upload(path, buffer, {
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("files")
        .getPublicUrl(path);

      imageUrls.push(data.publicUrl);
    }
  //Store uploaded images
  const {data: updatedJob, error: updateError} = await supabase
    .from("jobs")
    .update({ images: imageUrls })
    .eq("id", newJob.id)
    .select("*")
    .single();

  if (updateError) {
    console.log("Job update failed:", updateError);
    return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });
  }


  return new Response(
    JSON.stringify({ success: true, data: updatedJob }),
    { status: 200 }
  );
};


export const GET = async (req: Request) => {

  const supabase = await createClient();

//get the jobs and sort by created_at desc
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Job fetch failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true, data: jobs }), { status: 200 });  
};