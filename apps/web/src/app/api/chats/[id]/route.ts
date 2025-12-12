import { createClient } from "@/utils/supabase/server";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
    const supabase = await createClient();
    const param = await params;
    const chatId = param.id;

    //get the logged in user
    const { data: { user } } = await supabase.auth.getUser();

    //if user not logged in, return 401
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    //check if the user is a participant in the chat
    const { data: membership, error: mError } = await supabase
        .from("chat_users")
        .select("*")
        .eq("chat_id", chatId)
        .eq("user_id", user.id)
    //check if the user is the owner of the chat
    if (!membership?.length) {
        const { data: chat, error: chatError } = await supabase
            .from("chats")
            .select("*")
            .eq("id", chatId)
            .eq("owner_id", user.id);
        
        
        if (chatError) {
            return new Response(JSON.stringify({ error: chatError.message }), { status: 500 });
        }
        if (!chat.length) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
        }

    }

    if (mError) {
        return new Response(JSON.stringify({ error: mError.message }), { status: 500 });
    }

    //get the chat details along with messages and users
    const { data: chat, error } = await supabase
        .from("chats")
        .select("*, users(*), messages(*, users(*)), chat_users(id,users(*))")
        .eq("id", chatId)
        .order("created_at", { ascending: true })
        .single();

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

        chat.recipient = recipient;
        //remove unnecessary fields
        delete chat.users;
        delete chat.chat_users;
        delete chat.owner_id;

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ data:  chat}), { status: 200 });

};

//post message to a chat
export const POST = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
    const supabase = await createClient();
    const param = await params;
    const chatId = param.id;
    const data = await request.json();
    const { message } = data;

    //get the logged in user
    const { data: { user } } = await supabase.auth.getUser();

    //if user not logged in, return 401
    if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    //check if the user is a participant in the chat
    const { data: membership, error: mError } = await supabase
        .from("chat_users")
        .select("*")
        .eq("chat_id", chatId)
        .eq("user_id", user.id)
    //check if the user is the owner of the chat
    if (!membership?.length) {
        const { data: chat, error: chatError } = await supabase
            .from("chats")
            .select("*")
            .eq("id", chatId)
            .eq("owner_id", user.id)
            .single();
        if (chatError) {
            return new Response(JSON.stringify({ error: chatError.message }), { status: 500 });
        }
        if (!chat) {
            return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
        }
    }

    if (mError) {
        return new Response(JSON.stringify({ error: mError.message }), { status: 500 });
    }
    //insert the message
    const { data: newMessage, error } = await supabase
        .from("messages")
        .insert({
            chat_id: chatId,
            sender_id: user.id,
            content: message,
        })
        .select("*, users(*)")
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ data:  newMessage}), { status: 200 });
}