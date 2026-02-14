import connectToDB from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {
        const { ownerId, businessName, supportEmail, knowledge } = await req.json();
        if(!ownerId){
            return NextResponse.json({ message: "Owner ID is required" }, { status: 400 });
        }

        await connectToDB();

        const result = await Settings.findOneAndUpdate(
            { ownerId }, { businessName, supportEmail, knowledge }, { returnDocument: "after", upsert: true, includeResultMetadata: true }
        );

        const wasCreated = !result.lastErrorObject?.updatedExisting;

        return NextResponse.json(result, { status: wasCreated ? 201 : 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            message: `Error saving settings: ${error instanceof Error ? error.message : "Unknown error"}`
        }, { status: 500 });
    }
}
