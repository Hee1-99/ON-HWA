"use server";

import { createAdminClient } from "@/lib/supabase/serverAdmin";

export async function saveQuoteNaming(
  quoteId: string,
  aiName: string,
  aiStory: string,
  image: string | null
) {
  const admin = createAdminClient();

  let cardImgUrl: string | null = null;

  if (image && image.startsWith("data:image")) {
    // base64 → Storage 업로드
    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `quotes/${quoteId}_${Date.now()}.jpg`;

      const { error: uploadError } = await admin.storage
        .from("archives")
        .upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = admin.storage
          .from("archives")
          .getPublicUrl(fileName);
        cardImgUrl = publicUrl;
      }
    } catch (e) {
      console.error("Quote image upload error:", e);
    }
  } else if (image) {
    // 이미 URL인 경우 (재저장)
    cardImgUrl = image;
  }

  const { error } = await admin
    .from("custom_quotes")
    .update({ ai_name: aiName, ai_story: aiStory, card_img_url: cardImgUrl })
    .eq("id", quoteId);

  if (error) return { success: false, error: error.message };
  return { success: true, cardImgUrl };
}
