// after login from scalekit (through scalekit.getAuthorizationUrl()) in signin route, we will be redirected to this callback route where we can exchange the code for access token and refresh token and store it in cookies for future use

import getOrigin from "@/lib/getOrigin";
import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const origin = getOrigin(request);
    const redirectUri = `${origin}/api/auth/callback`;

    if(!code){
        return NextResponse.json({ message: "Code not found in query parameters" }, { status: 400 });
    }

    // Find session
    const session = await scalekit.authenticateWithCode(code, redirectUri);

    // Inside session we get all details regarding authenticated user and access token, refresh token etc
    const response = NextResponse.redirect(origin);
    response.cookies.set('access_token', session.accessToken, {
        httpOnly: true,
        maxAge: 24*60*60*1000,
        secure: true,
        path: "/"
    });

    return response;
} 