import "server-only";
import { cookies } from "next/headers";
import { CART_COOKIE } from "./index";

export async function readCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}
