import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n/server";

export default async function LocaleIndex() {
  redirect(`/${await getLocale()}/dashboard`);
}
