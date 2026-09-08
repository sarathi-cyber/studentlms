import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function safeCompareTokens(
  tokenA: string,
  tokenB: string,
): boolean {
  const hashA = Buffer.from(hashToken(tokenA), "hex");
  const hashB = Buffer.from(hashToken(tokenB), "hex");

  if (hashA.length !== hashB.length) {
    return false;
  }

  return timingSafeEqual(hashA, hashB);
}