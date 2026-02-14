import { cookies } from "next/headers";
import type { IdTokenClaim } from "@scalekit-sdk/node";
import { scalekit } from "./scalekit";

export async function getUserSession() {
  const session = await cookies();
  const token = session.get("access_token")?.value;

  if (!token) return null;

  try {
    const res = await scalekit.validateToken<IdTokenClaim>(token);
    const user = await scalekit.user.getUser(res.sub);
    return user;
  } catch {
    return null;
  }
}
