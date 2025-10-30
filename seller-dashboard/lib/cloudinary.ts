export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); // Bạn cần tạo upload preset trong Cloudinary
  formData.append("cloud_name", "dqxh4rmi3");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dqxh4rmi3/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};