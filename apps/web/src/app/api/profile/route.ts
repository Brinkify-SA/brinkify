import { getServerCookie, setServerCookie } from "@/utils/server/cookies"
import { createClient } from "@/utils/supabase/server";

export const POST = async (request: Request) => { 
    //GOAL: update the profile of the logged in user

  const data = await request.json();
  
  let [first_name, last_name] = data.full_name.split(" ");

  last_name = last_name || ""; //handle case where there is no last name
  
  const supabase = await createClient();
    
  //get the role of the current user from cookie
  const appUser = await getServerCookie("app-user");

  if (!appUser) {
      await supabase.auth.signOut();//sign the user out if they are signed in.
      return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  //update only the first name and last name in the users table
  const { data: updatedUser, error: userError } = await supabase.from("users").update({
      first_name,
      last_name
  }).eq("id", appUser.id).single();

//update the appUser object
  appUser.first_name = first_name;
  appUser.last_name = last_name;

  if(userError) {
      return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
  }

  //update the profile of the user based on their role
  let profileError = null;
  let profileData = null;
  switch (appUser.role.toLowerCase()) {
      case 'worker':
          {
              const { data: updatedWorker, error: workerError } = await supabase.from("workers").update({
                  skills: data.skills,
                  bio: data.bio
              }).eq("user_id", appUser.id).select().single();;
              profileError = workerError;
              profileData = updatedWorker;
              appUser.workers = updatedWorker;
          }
          break;
      case 'company':
          break;
      case 'customer':
          break;
      default:
          return new Response(JSON.stringify({ error: "Unauthorized: Invalid role" }), { status: 401 });
  }

  if(profileError) {
        return new Response(JSON.stringify({ error: profileError.message }), { status: 400 });
  }
  
  //set the updated appUser cookie
  await setServerCookie("app-user", appUser);

    return new Response(JSON.stringify({ data: profileData }), { status: 200 });
}