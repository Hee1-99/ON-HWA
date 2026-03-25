"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveArchive(bouquetId: string, base64PhotoData: string, visitorId: string) {
  // Demo handling for mock IDs
  if (bouquetId.startsWith("mock")) {
    console.log("Mock archive saved for bouquet:", bouquetId, "visitorId:", visitorId);
    return { success: true };
  }

  const supabase = await createClient();

  try {
    // 1. Convert base64 string to Buffer
    const base64Data = base64PhotoData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique file name
    const fileName = `${bouquetId}/${Date.now()}.jpg`;

    // 2. Upload to Supabase Storage ('archives' bucket)
    const { error: uploadError } = await supabase
      .storage
      .from('archives')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // 3. Get Public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('archives')
      .getPublicUrl(fileName);

    // 4. Insert the public URL into the 'archives' table
    const { error: dbError } = await supabase
      .from('archives')
      .insert({
        bouquet_id: bouquetId,
        card_img_url: publicUrl,
        visitor_id: visitorId
      });

    if (dbError) {
      console.error("Archive DB insert error:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Archive processing error:", error);
    return { success: false, error: error.message || "알 수 없는 오류가 발생했습니다." };
  }
}
