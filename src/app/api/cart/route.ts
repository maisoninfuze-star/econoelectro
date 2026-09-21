import { NextResponse, type NextRequest } from "next/server";
import { getCommerce, CART_COOKIE, CommerceError } from "@/lib/commerce";
import type { Cart, CartAddInput, CartUpdateInput } from "@/lib/commerce/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body =
  | { action: "get" }
  | ({ action: "add" } & CartAddInput)
  | ({ action: "update" } & CartUpdateInput)
  | { action: "remove"; lineId: string }
  | { action: "clear" };

function respond(cart: Cart | null, status = 200) {
  const res = NextResponse.json({ cart }, { status });
  if (cart) {
    res.cookies.set(CART_COOKIE, cart.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  } else {
    res.cookies.set(CART_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CART_COOKIE)?.value ?? null;
  try {
    const cart = await getCommerce().getCart(token);
    return respond(cart);
  } catch {
    return respond(null);
  }
}

export async function POST(request: NextRequest) {
  const commerce = getCommerce();
  const token = request.cookies.get(CART_COOKIE)?.value ?? null;
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  try {
    switch (body.action) {
      case "get":
        return respond(await commerce.getCart(token));
      case "add": {
        const { action: _a, ...input } = body;
        void _a;
        return respond(await commerce.addToCart(token, input));
      }
      case "update": {
        if (!token) return NextResponse.json({ error: "cart_not_found" }, { status: 404 });
        const { action: _a, ...input } = body;
        void _a;
        return respond(await commerce.updateCartLine(token, input));
      }
      case "remove":
        if (!token) return NextResponse.json({ error: "cart_not_found" }, { status: 404 });
        return respond(await commerce.removeCartLine(token, body.lineId));
      case "clear":
        return respond(null);
      default:
        return NextResponse.json({ error: "unknown_action" }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof CommerceError) {
      const status = err.code === "quantity_limit" || err.code === "out_of_stock" || err.code === "price_on_request" ? 409 : 400;
      return NextResponse.json({ error: err.code, meta: err.meta ?? null }, { status });
    }
    console.error("[api/cart]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
