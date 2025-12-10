import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

/**
 * GET /api/profile - Fetch authenticated user's profile
 * Returns the complete user profile from the profiles table
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "User not authenticated" }),
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Database error fetching profile:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profile", details: error.message }),
        { status: 500 }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(profile), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/profile:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile - Update authenticated user's profile
 * Updates specified fields in the profiles table
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "User not authenticated" }),
        { status: 401 }
      );
    }

    // Parse request body
    let updateData;
    try {
      updateData = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400 }
      );
    }

    // Prevent updating certain fields
    const allowedFields = [
      "full_name",
      "avatar_url",
      "location",
      "role",
      "skills",
      "bio",
      "hourly_rate",
      "portfolio",
      "bank_name",
      "account_number",
      "branch_code",
      "id_number",
      "company_name",
      "team_size",
      "preferred_categories",
    ];

    // Filter to only allowed fields
    const filteredData: any = {};
    for (const key of allowedFields) {
      if (key in updateData) {
        filteredData[key] = updateData[key];
      }
    }

    // Add updated_at timestamp
    filteredData.updated_at = new Date().toISOString();

    // Update profile
    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(filteredData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating profile:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update profile", details: error.message }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(updatedProfile), { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/profile:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile - Legacy endpoint (for backward compatibility)
 * Redirects to PATCH with same data
 */
export const POST = async (request: Request) => {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use PATCH to update profile.' }),
    { status: 405 }
  );
};