import { prisma } from "@/lib/prisma";

// Simple in-memory rate limit (MVP only)
// For production use Redis / Upstash

const rateLimits = new Map();

const QUOTA = 50;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function authenticateToken(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or Invalid Token", status: 401 };
  }

  const tokenStr = authHeader.split(" ")[1];

  try {
    const tokenRecord = await prisma.token.findUnique({
      where: { token: tokenStr },
      include: { user: true },
    });

    if (!tokenRecord) {
      return { error: "Invalid API Token", status: 401 };
    }

    if (tokenRecord.isRevoked) {
      return { error: "Token has been revoked", status: 403 };
    }

    /* =========================
       Rate Limit Logic
    ========================= */

    const now = Date.now();
    const userLimit = rateLimits.get(tokenStr);

    if (userLimit) {
      if (now - userLimit.startTime > WINDOW_MS) {
        rateLimits.set(tokenStr, {
          count: 1,
          startTime: now,
        });
      } else {
        if (userLimit.count >= QUOTA) {
          return { error: "Rate limit exceeded", status: 429 };
        }

        userLimit.count++;
      }
    } else {
      rateLimits.set(tokenStr, {
        count: 1,
        startTime: now,
      });
    }

    /* =========================
       Update last used
    ========================= */

    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { lastUsed: new Date() },
    });

    return {
      user: tokenRecord.user,
      tokenRecord,
    };
  } catch (error) {
    console.error("Auth error:", error);

    return { error: "Internal Server Error", status: 500 };
  }
}