require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadVideos() {
  try {
    console.log("Uploading Continuous Shot Video...");
    const res1 = await cloudinary.uploader.upload("public/videos/Continuous_Shot_Company_Video_Generation.mp4", {
      resource_type: "video",
      public_id: "Continuous_Shot_Company_Video_Generation",
      overwrite: true
    });
    console.log("Uploaded! URL:", res1.secure_url);

    console.log("Uploading New UI Video...");
    const res2 = await cloudinary.uploader.upload("public/videos/new_ui_video.mp4", {
      resource_type: "video",
      public_id: "new_ui_video",
      overwrite: true
    });
    console.log("Uploaded! URL:", res2.secure_url);
    
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

uploadVideos();
