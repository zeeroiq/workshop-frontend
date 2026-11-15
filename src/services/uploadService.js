// SECURITY WARNING: These credentials should be moved to environment variables
// TODO: Implement server-side upload proxy to avoid exposing cloud credentials
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dc7cojpvn";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "inventry_management";

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url; // ✅ Image URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
