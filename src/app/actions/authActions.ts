"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();
  
  // Clear the session from cookies
  await supabase.auth.signOut();
  
  // Clear frontend cache and redirect to login page
  revalidatePath('/', 'layout');
  redirect('/login');
}
