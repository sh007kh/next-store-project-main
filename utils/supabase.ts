import { createClient } from "@supabase/supabase-js";

const bucket = "main-bucket";

// Create a single supabase client for interacting with your database
const createSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not set");
  }
  return createClient(url, key);
};

export const uploadImage = async (image: File) => {
  const supabase = createSupabaseClient();
  const timestamp = Date.now();
  // const newName = `/users/${timestamp}-${image.name}`;
  const newName = `${timestamp}-${image.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(newName, image, {
      cacheControl: "3600",
    });
  if (!data) throw new Error("Image upload failed");
  return supabase.storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};

export const deleteImage = (url: string) => {
  const supabase = createSupabaseClient();
  const imageName = url.split("/").pop();
  if (!imageName) throw new Error("Invalid URL");
  return supabase.storage.from(bucket).remove([imageName]);
};
