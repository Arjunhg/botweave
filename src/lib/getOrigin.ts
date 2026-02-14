import { NextRequest } from "next/server";

export default function getOrigin(request: NextRequest){
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");

    const host = forwardedHost ?? request.headers.get("host");
    const protocol = forwardedProto ?? "http";

    return `${protocol}://${host}`;
}