"use server";

import { createAdminClient } from "@/lib/supabase/serverAdmin";

/**
 * 클라이언트에서 Storage 업로드 완료 후 DB에만 레코드를 저장합니다.
 * base64를 서버로 전달하지 않으므로 Server Action body 크기 제한 문제가 없습니다.
 */
export async function saveArchiveRecord(
  bouquetId: string,
  cardImgUrl: string,
  visitorId: string
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("archives").insert({
    bouquet_id: bouquetId,
    card_img_url: cardImgUrl,
    visitor_id: visitorId,
  });
  if (error) {
    console.error("Archive DB insert error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
