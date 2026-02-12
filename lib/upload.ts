import { getSupabase, VEHICLE_IMAGES_BUCKET } from "./supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadVehicleImage(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo es muy grande. Máximo 5MB.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato de imagen no válido. Use JPG, PNG o WebP.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `vehicles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await getSupabase().storage
    .from(VEHICLE_IMAGES_BUCKET)
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", JSON.stringify(error, null, 2));
    console.error("Error details:", {
      message: error.message,
      statusCode: error.statusCode,
      bucket: VEHICLE_IMAGES_BUCKET,
      filename: filename,
    });
    throw new Error(`Error de Supabase: ${error.message || JSON.stringify(error)}`);
  }

  const {
    data: { publicUrl },
  } = getSupabase().storage.from(VEHICLE_IMAGES_BUCKET).getPublicUrl(filename);

  return publicUrl;
}

export async function deleteVehicleImage(imageUrl: string): Promise<void> {
  try {
    // Extract path from public URL
    const urlParts = imageUrl.split(`${VEHICLE_IMAGES_BUCKET}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    await getSupabase().storage.from(VEHICLE_IMAGES_BUCKET).remove([filePath]);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}
