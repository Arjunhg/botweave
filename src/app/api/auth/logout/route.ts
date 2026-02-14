import getOrigin from "@/lib/getOrigin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    // we have to remove the cookie present in the session
    const session = await cookies();
    session.delete('access_token');
    const redirectUrl = getOrigin(req);
    return NextResponse.redirect(redirectUrl);
}