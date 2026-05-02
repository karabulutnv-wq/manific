import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOne(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `manific/${folder}`,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      },
      (err, res) => {
        if (err || !res) reject(err);
        else resolve(res.secure_url);
      }
    ).end(buffer);
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const folder = (formData.get("folder") as string) || "misc";

  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });

  // Max 5 per request, upload in parallel
  const batch = files.slice(0, 5);

  const results = await Promise.all(
    batch.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      return uploadOne(buffer, folder);
    })
  );

  return NextResponse.json({ urls: results });
}
