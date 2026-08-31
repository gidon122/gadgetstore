import { GET as getCartHandler } from "./get/route";
import { POST as addCartHandler } from "./add/route";

export async function GET(request) {
  return getCartHandler(request);
}

export async function POST(request) {
  return addCartHandler(request);
}
