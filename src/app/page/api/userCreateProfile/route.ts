import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { userWalletAddress, profilePic, personalLink, username, newUserId } = await req.json();

    // Validate input fields
    if (!userWalletAddress || !profilePic || !personalLink || !username) {
      return NextResponse.json(
        { error: "All fields (userWalletAddress, profilePic, personalLink, username) are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    const { db } = await connectToDatabase();

    // Check if the user already exists
    const existingUser = await db.collection("users").findOne({ userWalletAddress });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with the given wallet address already exists." },
        { status: 400 }
      );
    }



    // Insert the user into the database with the new userId
    const result = await db.collection("users").insertOne({
      userId: newUserId,
      userWalletAddress,
      profilePic,
      personalLink,
      username,
    });

    // Check if the insert was successful
    if (!result.insertedId) {
      return NextResponse.json(
        { error: "An error occurred while inserting the user data." },
        { status: 500 }
      );
    }

    // Return a success response
    return NextResponse.json(
      { message: "User created successfully", userId: result.insertedId, newUserId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error during user creation:", error.message);

    // Return a generic error response
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
