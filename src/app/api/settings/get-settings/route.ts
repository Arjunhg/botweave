import connectToDB from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const ownerId = req.nextUrl.searchParams.get("ownerId");

        if(!ownerId){
            return NextResponse.json({ message: "Owner ID is required" }, { status: 400 });
        } 
        
        await connectToDB();
        
        const result = await Settings.findOne({ ownerId });

        if(!result){
            return NextResponse.json({ message: "Settings not found" }, { status: 404 });
        }
        
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({
            message: `Error retrieving settings: ${error instanceof Error ? error.message : "Unknown error"}`
        }, { status: 500 });
    }
}
