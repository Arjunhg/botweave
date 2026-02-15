import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "./lib/getUserSession";
import getOrigin from "./lib/getOrigin";

export default async function proxy(req: NextRequest){
    const session = await getUserSession();
    const redirectUrl = getOrigin(req) + "/?error=unauthenticated";
    if(!session){
        return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/embed/:path*']
}
