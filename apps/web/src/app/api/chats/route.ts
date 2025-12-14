import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async() => {
    const supabase = await createClient();
    //get the logged in user
    const { data: { user } } = await supabase.auth.getUser();

    //if user not logged in, return 401
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

   
    //get the chat_id's where the user is a participant
    const { data: memberships, error: cuError } = await supabase
        .from("chat_users")
        .select("chat_id")
        .eq("user_id", user.id);
    

    if (cuError) {
    return new Response(JSON.stringify({ error: cuError.message }), { status: 500 });
    }

    //extract chat ids
    const chatIds = memberships?.map(m => m.chat_id) ?? [];

    //get the chats where the user is the owner or a participant
    const { data: chats, error } = await supabase
    .from("chats")
    .select(`
        *,
        messages(*),
        users(*),
        chat_users(*, users(*))
    `)
    .or(`owner_id.eq.${user.id},id.in.(${chatIds.join(",")})`)
    .order("created_at", { ascending: false });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    //give the reciepient user details to each chat
    const enrichedChats = chats?.map(chat => {
        //check if the user is the owner
        const isOwner = chat.owner_id === user.id;
        //if the logged in user is not the owner, the "users" field contains the owner details
        let recipient;
        if (!isOwner) {
            recipient = chat.users;
            
        } else {
            //if the logged in user is the owner, the "users" field in chat_users contains the recipient details
            recipient = chat.chat_users.find((cu : any) => cu.user_id !== user.id)?.users;
            
        }

        //remove unnecessary fields
        delete chat.users;
        delete chat.chat_users;
        delete chat.owner_id;

        return {
            ...chat,
            recipient
        }
    });


    //return the chats
    return new Response(JSON.stringify({ data: enrichedChats }), { status: 200 });

}

export const POST = async (request: NextRequest) => {
    const supabase = await createClient();
    //get the recipient id(user_id), create a new chat, the owner being the logged in user
    const data = await request.json();
    const { user_id } = data;

    //if the user_id is not in the request body params
    if (!user_id) {
        return new Response(JSON.stringify({error: "user_id required in the body params" }), { status: 500 });
    }

    //get the logged in user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    //create a new chat
    const { data: newChat, error: mError } = await supabase.from("chats").insert({
        owner_id: user.id,
    }).select().single();

    if (mError) {
        return new Response(JSON.stringify({ error: mError.message }), { status: 500 });
    }

    //add the recipient in the chat_users table
    const { data: membership, error: cuError } = await supabase.from("chat_users").insert({
        chat_id: newChat.id,
        user_id: user_id
    }).select().single();

    if (cuError) {  
        return new Response(JSON.stringify({ error: cuError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ data: newChat }), { status: 200 });
}