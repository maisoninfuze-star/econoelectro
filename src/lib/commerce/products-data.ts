import productsJson from "@/data/products.json";
import type { Product } from "./types";

/** Demo catalog (cleaned from the previous Hostinger store). Used by the local provider. */
export const LOCAL_PRODUCTS: Product[] = productsJson as unknown as Product[];
