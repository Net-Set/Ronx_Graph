import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    // Extract wallet address from the query parameters
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");

    // Validate input
    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    const { db } = await connectToDatabase();

    // Find the user by walletAddress
    const user = await db.collection("users").findOne({ userWalletAddress: walletAddress });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with the given wallet address" },
        { status: 404 }
      );
    }

    // Return the profile picture URL or a default avatar
    return NextResponse.json({
      profilePic: user.profilePic || "/uploads/default-avatar.jpg",
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
