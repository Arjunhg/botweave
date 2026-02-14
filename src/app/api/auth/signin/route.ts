import getOrigin from "@/lib/getOrigin";
import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const origin = getOrigin(request);
    const redirectUri = `${origin}/api/auth/callback`;
    const url = scalekit.getAuthorizationUrl(redirectUri);
    return NextResponse.redirect(url);
}