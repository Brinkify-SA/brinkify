import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const likePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('likes')
    .insert([{ post_id: postId, user_id: userId }]);

  if (error) {
    throw error;
  }

  return data;
};

export const commentOnPost = async (postId: string, userId: string, comment: string) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id: postId, user_id: userId, comment }]);

  if (error) {
    throw error;
  }

  return data;
};
