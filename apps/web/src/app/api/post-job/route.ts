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

  // Parse user session
  if (!encodedProfile) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 });
  }

  const user = JSON.parse(decodeBase64(encodedProfile));   
  console.log("User from session:", user);

  // Validate fields
  if (!body.title || !body.description || !body.category || !body.location) {
    return new Response(
      JSON.stringify({ message: "Missing required job fields." }),
      { status: 400 }
    );
  }

  
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (customerError || !customer) {
    console.error("Customer lookup failed:", customerError);
    return new Response(
      JSON.stringify({ 
        error: "Customer account not found. Please complete your profile first.",
        details: customerError?.message
      }), 
      { status: 400 }
    );
  }

  //Safely convert budget values to numbers or null
  const minPrice = body.minBudget && body.minBudget !== '' 
    ? parseFloat(body.minBudget) 
    : null;
    
  const maxPrice = body.maxBudget && body.maxBudget !== '' 
    ? parseFloat(body.maxBudget) 
    : null;

  //Validate numeric values
  if ((minPrice !== null && isNaN(minPrice)) || (maxPrice !== null && isNaN(maxPrice))) {
    return new Response(
      JSON.stringify({ 
        error: "Invalid budget values", 
        details: "Budget values must be valid numbers"
      }),
      { status: 400 }
    );
  }

  // Store jobs data
  const { data: newJob, error: jobError } = await supabase
    .from("jobs")                            
    .insert({
      customer_id: customer.id,  
      title: body.title,
      description: body.description,
      open: true,
      min_price: minPrice,
      max_price: maxPrice,
      category: body.category,
      location: body.location,
      created_at: new Date().toISOString()   
    })
    .select("*")                              
    .single();

  if (jobError) {
    console.error("Job insertion failed:", {
      message: jobError.message,
      code: jobError.code,
      details: jobError.details,
      hint: jobError.hint
    });
    return new Response(
      JSON.stringify({ 
        error: jobError.message,
        details: {
          code: jobError.code,
          details: jobError.details,
          hint: jobError.hint
        }
      }), 
      { status: 400 }
    );
  }

  // Store uploaded images
  if (body.images && body.images.length > 0) {
    const imageRecords = body.images.map((url: string) => ({
      id: uuidv4(),                           
      job_id: newJob.id,                      
      url,                                   
      uploaded_at: new Date().toISOString()
    }));

    const { error: imgError } = await supabase.from("job_images").insert(imageRecords);

    if (imgError) {
      console.error("Image upload failed:", imgError);
      console.warn("Job created but images failed to upload");
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      jobId: newJob.id,
      message: "Job posted successfully"
    }),
    { status: 200 }
  );
};

