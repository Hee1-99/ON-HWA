"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/serverAdmin";
import { revalidatePath } from "next/cache";

export async function createCustomRequest(
  recipientTarget: string,
  occasion: string,
  budget: string,
  aiFlowerRecommendation: string,
  aiMessage: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const admin = createAdminClient();

  const { error } = await admin.from("custom_requests").insert({
    buyer_id: user.id,
    recipient_target: recipientTarget,
    occasion,
    budget,
    ai_flower_recommendation: aiFlowerRecommendation,
    ai_message: aiMessage,
    status: "pending"
  });

  if (error) {
    return { success: false, error: `요청 등록 실패: ${error.message}` };
  }

  revalidatePath("/archive");
  return { success: true };
}

export async function submitQuote(
  requestId: string,
  price: number,
  description: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const admin = createAdminClient();

  // 1. Get florist shop id
  const { data: shop, error: shopError } = await admin
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shopError || !shop) {
    return { success: false, error: "상점 정보를 찾을 수 없습니다." };
  }

  // 2. Add Quote
  const { error: quoteError } = await admin.from("custom_quotes").insert({
    request_id: requestId,
    shop_id: shop.id,
    price,
    description,
    status: "submitted"
  });

  if (quoteError) {
    return { success: false, error: `견적 등록 실패: ${quoteError.message}` };
  }

  // 3. Update request status to 'quoting' if it was 'pending'
  await admin
    .from("custom_requests")
    .update({ status: "quoting" })
    .eq("id", requestId)
    .eq("status", "pending");

  revalidatePath("/dashboard/requests");
  return { success: true };
}

export async function acceptQuote(quoteId: string, requestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "로그인이 필요합니다." };

  const admin = createAdminClient();

  // 1. Validate the buyer owns this request
  const { data: request, error: reqError } = await admin
    .from("custom_requests")
    .select("buyer_id")
    .eq("id", requestId)
    .single();

  if (reqError || request.buyer_id !== user.id) {
    return { success: false, error: "권한이 없습니다." };
  }

  // 2. Update quote statuses (Accept one, reject rest)
  await admin
    .from("custom_quotes")
    .update({ status: "rejected" })
    .eq("request_id", requestId)
    .neq("id", quoteId);

  await admin
    .from("custom_quotes")
    .update({ status: "accepted" })
    .eq("id", quoteId);

  // 3. Update request status
  await admin
    .from("custom_requests")
    .update({ status: "awarded" })
    .eq("id", requestId);

  revalidatePath(`/archive/orders/${requestId}`);
  return { success: true };
}
