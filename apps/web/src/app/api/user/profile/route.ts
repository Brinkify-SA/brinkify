// app/api/user/profile - GET current authenticated user
import { getServerCookie } from "@/utils/server/cookies";
import { NextResponse } from "next/server";

export async function GET() {
  const appUser = await getServerCookie("app-user");

  if (!appUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(appUser, { status: 200 });
}
