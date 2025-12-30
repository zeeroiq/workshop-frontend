// secret=czyVdpcGz-PmrYK4Q9dL_bI_S1g
// key=464539689816816
// services/cloudinaryUpload.js

export const uploadImageToCloudinary = async (file) => {
  const CLOUD_NAME = "dc7cojpvn";
  const UPLOAD_PRESET = "inventry_management";

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
