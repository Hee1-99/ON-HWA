"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import { revalidatePath } from "next/cache";

export async function updateRecipientPhone(
  linkId: string,
  _recipientName: string,
  recipientPhone: string
): Promise<{ success: boolean; error?: string }> {
  if (!recipientPhone.trim()) {
    return { success: false, error: "전화번호를 입력해주세요." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("bouquets")
    .update({ recipient_phone: recipientPhone.trim() })
    .eq("link_id", linkId)
    .in("status", ["sent", "archived"]); // 공개된 꽃다발만 수정 허용

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/flower/${linkId}`);
  return { success: true };
}

export async function createBouquet(name: string, story: string, imageUrl: string) {
  // 인증 확인은 일반 클라이언트(쿠키 기반)로
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: '인증 세션이 만료되었습니다.' };

  // DB 작업은 Admin 클라이언트로 — RLS JWT 전파 문제 우회
  const admin = createAdminClient();

  // 1. 기존 상점 조회
  const { data: shop, error: shopSelectError } = await admin
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (shopSelectError && shopSelectError.code !== 'PGRST116') {
    return { success: false, error: `상점 조회 오류: ${shopSelectError.message}` };
  }

  // 2. 상점 없으면 자동 생성
  let shopId: string;

  if (!shop) {
    const randomSlug = `shop_${Math.random().toString(36).substring(2, 8)}`;
    const { data: newShop, error: newShopError } = await admin
      .from('shops')
      .insert({ owner_id: user.id, name: '나의 꽃집', slug: randomSlug, plan_type: 'free' })
      .select('id')
      .single();

    if (newShopError || !newShop) {
      return {
        success: false,
        error: `상점 자동 생성 실패: ${newShopError?.message ?? '알 수 없는 오류'}`,
      };
    }
    shopId = newShop.id;
  } else {
    shopId = shop.id;
  }

  // 3. 실제 꽃다발 이미지를 Storage에 업로드하여 Public URL 채번 (카카오톡 공유를 위해 필수)
  let finalImageUrl = imageUrl;
  if (imageUrl && imageUrl.startsWith('data:image')) {
    try {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `bouquets/${Date.now()}.jpg`;

      const { error: uploadError } = await admin
        .storage
        .from('archives') // 편의상 기존에 만든 public 버킷 재사용
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (!uploadError) {
        const { data: { publicUrl } } = admin
          .storage
          .from('archives')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      } else {
        console.error("Bouquet image storage upload error:", uploadError);
      }
    } catch (e) {
      console.error("Image processing error:", e);
    }
  }

  // 4. 꽃다발 등록
  const { error: bouquetError } = await admin.from('bouquets').insert({
    shop_id:          shopId,
    ai_name:          name,
    ai_story:         story,
    original_img_url: finalImageUrl,
    status:           'draft',
    // link_id는 DB DEFAULT(gen_random_bytes)로 자동 생성
  });

  if (bouquetError) {
    return { success: false, error: `꽃다발 등록 오류: ${bouquetError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function confirmSale(bouquetId: string, recipientPhone: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from('bouquets')
    .update({
      status: 'sent',
      recipient_phone: recipientPhone,
      sent_at: new Date().toISOString(),
    })
    .eq('id', bouquetId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
