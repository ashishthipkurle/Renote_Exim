import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerAuthContext } from "@/lib/auth-server";
import { validateFileUpload } from "@/lib/upload-validation";

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
 try {
 const auth = await getServerAuthContext(req);
 
 if (!auth) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 if (auth.role !== "EXPORTER" && auth.role !== "ADMIN") {
 return NextResponse.json({ error: "Access denied. Exporters only." }, { status: 403 });
 }

 const formData = await req.formData();
 const file = formData.get("file") as File | null;

 if (!file) {
 return NextResponse.json({ error: "No file provided" }, { status: 400 });
 }

 const validation = validateFileUpload(file, "productImage");
 if (!validation.isValid) {
 return NextResponse.json({ error: validation.error }, { status: 400 });
 }

 const bytes = await file.arrayBuffer();
 const buffer = Buffer.from(bytes);

 const uploadResponse = await new Promise((resolve, reject) => {
 const uploadStream = cloudinary.uploader.upload_stream(
 { folder: "renote-exim/products" },
 (error, result) => {
 if (error) reject(error);
 else resolve(result);
 }
 );
 uploadStream.end(buffer);
 });

 return NextResponse.json({ url: (uploadResponse as any).secure_url }, { status: 200 });
 } catch (error: any) {
 console.error("Upload error:", error);
 return NextResponse.json(
 { error: error.message || "Failed to upload file" },
 { status: 500 }
 );
 }
}
