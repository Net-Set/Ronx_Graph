import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    // Extract `userid` from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    // Validate `userid` input
    if (!userId) {
      return NextResponse.json(
        { error: "userid is required" },
        { status: 400 }
      );
    }

    // Parse `userid` as an integer
    const numericUserId = parseInt(userId, 10);

    // Check if `userid` is valid
    if (isNaN(numericUserId)) {
      return NextResponse.json(
        { error: "Invalid userid. It must be a number." },
        { status: 400 }
      );
    }

    // Connect to the database
    const { db } = await connectToDatabase();

    // Find the user by `userid`
    const user = await db.collection("users").findOne({ userid: numericUserId });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with the given userid" },
        { status: 404 }
      );
    }

    // Return the wallet address
    return NextResponse.json({
      walletAddress: user.userWalletAddress,
    });
  } catch (error: any) {
    console.error("Error during lookup:", error.message);

    // Return a generic error response
    return NextResponse.json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
