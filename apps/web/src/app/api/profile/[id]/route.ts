import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/profile/[id] - Fetch a specific user's public profile
 * Returns the user profile data (public fields only)
 */
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const supabase = await createClient();

    // Normalize params: Next's types sometimes make params a Promise in build-time checks
    let params = context?.params;
    if (params && typeof params.then === 'function') {
      params = await params;
    }
    const userId = params?.id as string;

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, location, role, bio, skills, hourly_rate, portfolio, average_rating"
      )
      .eq("id", userId)
      .single();

    if (error || !profile) {
      console.error("Database error fetching profile:", error);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404 }
      );
    }

    // Count reviews/ratings
    const { count: reviewsCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .eq("reviewed_id", userId);

    return new Response(
      JSON.stringify({
        ...profile,
        reviews_count: reviewsCount || 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/profile/[id]:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
