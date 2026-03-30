"use server";

import { createAdminClient } from "@/lib/supabase/serverAdmin";

/**
 * 포토카드 dataUrl(base64) 또는 publicUrl을 받아
 * Storage 업로드(base64인 경우)와 DB 레코드 저장을 모두 adminClient로 처리합니다.
 * RLS를 완전히 우회합니다.
 */
export async function saveArchiveRecord(
  bouquetId: string,
  imageData: string,   // base64 dataUrl 또는 이미 업로드된 publicUrl
  visitorId: string
) {
  const supabase = createAdminClient();

  try {
    let cardImgUrl = imageData;

    // base64 dataUrl인 경우 → Storage에 업로드 후 publicUrl 획득
    if (imageData.startsWith("data:image")) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${bouquetId}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("archives")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { success: false, error: "Storage 업로드 실패: " + uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from("archives")
        .getPublicUrl(fileName);

      cardImgUrl = publicUrl;
    }

    // DB insert — adminClient이므로 RLS 우회됨
    const { error: dbError } = await supabase.from("archives").insert({
      bouquet_id: bouquetId,
      card_img_url: cardImgUrl,
      visitor_id: visitorId,
    });

    if (dbError) {
      console.error("Archive DB insert error:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, url: cardImgUrl };
  } catch (error: any) {
    console.error("Archive processing error:", error);
    return { success: false, error: error.message ?? "알 수 없는 오류" };
  }
}
