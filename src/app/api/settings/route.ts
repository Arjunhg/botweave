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
            { ownerId }, { businessName, supportEmail, knowledge }, { new: true, upsert: true, rawResult: true }
        );

        const wasCreated = !result.lastErrorObject.updatedExisting;
        const statusCode = wasCreated ? 201 : 200;

        return NextResponse.json(result.value, { status: statusCode });

    } catch (error) {
        return NextResponse.json({
            message: `Error saving settings: ${error instanceof Error ? error.message : "Unknown error"}`
        }, { status: 500 });
    }
}
