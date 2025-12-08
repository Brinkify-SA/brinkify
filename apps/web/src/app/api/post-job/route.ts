import { createClient } from "@/utils/supabase/server";  
import { cookies } from "next/headers";                 
import { v4 as uuidv4 } from "uuid";                     


function decodeBase64(str: string) {
  return Buffer.from(str, "base64").toString("utf-8"); 
}

export const POST = async (req: Request) => {

  const supabase = await createClient();
  const body = await req.json();
  const cookieStore = await cookies();                                  
  const encodedProfile = cookieStore.get("app-user")?.value;      

  //parse user session
  if (!encodedProfile) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 });
  }

  const user = JSON.parse(decodeBase64(encodedProfile));   

  //Validate required fields before storing
  if (!body.title || !body.description || !body.category || !body.location) {
    return new Response(
      JSON.stringify({ message: "Missing required job fields." }),
      { status: 400 }
    );
  }

  //Store Jobs data
  const { data: newJob, error: jobError } = await supabase
    .from("jobs")                            
    .insert({
      id: uuidv4(),                          
      owner_id: user.id,                   
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      min_price: body.minBudget || null,
      max_price: body.maxBudget || null,
      created_at: new Date().toISOString()   
    })
    .select("*")                              
    .single();

  if (jobError) {
    console.log("Job insertion failed:", jobError);
    return new Response(JSON.stringify({ error: jobError.message }), { status: 400 });
  }

  //Store uploaded images
  if (body.images && body.images.length > 0) {

    const imageRecords = body.images.map((url: string) => ({
      id: uuidv4(),                           
      job_id: newJob.id,                      
      url,                                   
      uploaded_at: new Date().toISOString()
    }));

    const { error: imgError } = await supabase.from("job_images").insert(imageRecords);

    if (imgError) {
      console.log("Image upload failed:", imgError);
      return new Response(JSON.stringify({ error: imgError.message }), { status: 400 });
    }
  }

  return new Response(
    JSON.stringify({ success: true, jobId: newJob.id }),
    { status: 200 }
  );
};
