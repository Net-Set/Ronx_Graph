import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid"; // To generate unique file names

export async function POST(req: Request) {
  try {
    // Parse the incoming request
    const contentType = req.headers.get("content-type");

    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Request must be multipart/form-data" },
        { status: 400 }
      );
    }

    // Use FormData API to parse the request
    const formData = await req.formData();
    const userWalletAddress = formData.get("userWalletAddress") as string;
    const username = formData.get("username") as string;
    const profilePic = formData.get("profilePic") as File | null;

    // Validate input
    if (!userWalletAddress || !username) {
      return NextResponse.json(
        { error: "userWalletAddress and username are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Connect to the database
    const { db } = await connectToDatabase();

    // Check if the user exists based on userWalletAddress
    const user = await db.collection("users").findOne({ userWalletAddress });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Handle profile picture upload
    let profilePicPath = user.profilePic; // Default to existing profilePic if no new one is uploaded
    if (profilePic) {
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadsDir, { recursive: true }); // Ensure the uploads directory exists

      const fileExtension = profilePic.name.split(".").pop();
      const fileName = `${nanoid()}.${fileExtension}`;
      profilePicPath = `/uploads/${fileName}`;

      // Save the file to the uploads directory
      const fileBuffer = Buffer.from(await profilePic.arrayBuffer());
      await fs.writeFile(path.join(uploadsDir, fileName), new Uint8Array(fileBuffer));
    }

    // Update the user's username and profile picture in the database
    const result = await db.collection("users").updateOne(
      { userWalletAddress }, // Identifying user by wallet address
      { $set: { username, profilePic: profilePicPath } } // Updating username and profilePic
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No changes made. Data might already be the same." },
        { status: 400 }
      );
    }

    // Return success message
    return NextResponse.json({
      message: "Profile updated successfully",
      profilePic: profilePicPath,
    });

  } catch (error: any) {
    console.error("Error during update:", error.message); // Log the error message for debugging

    return NextResponse.json(
      { error: `An error occurred while updating the profile: ${error.message}` },
      { status: 500 }
    );
  }
}
