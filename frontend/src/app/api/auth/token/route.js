import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth";
import crypto from "crypto";

/* =========================
   POST - Generate new token
   ========================= */

export async function POST(req) {
  try {
    const { name, email } = await req.json();   

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and token name are required" },
        { status: 400 }
      );
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: email.split("@")[0],
      },
    });

    // Generate secure token
    const tokenStr = "vr_" + crypto.randomBytes(24).toString("hex");

    const token = await prisma.token.create({
      data: {
        token: tokenStr,
        name,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Token generated",
        token: token.token,
        name: token.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

/* =========================
   GET - List user tokens
   ========================= */

export async function GET(req) {
  const auth = await authenticateToken(req);

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const tokens = await prisma.token.findMany({
      where: { userId: auth.user.id },
      select: {
        id: true,
        name: true,
        token: true,
        isRevoked: true,
        createdAt: true,
        lastUsed: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to list tokens" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE - Revoke token
   ========================= */

export async function DELETE(req) {
  const auth = await authenticateToken(req);

  if (auth.error) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { tokenId } = await req.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: "tokenId is required" },
        { status: 400 }
      );
    }

    // Verify token belongs to user
    const token = await prisma.token.findFirst({
      where: {
        id: tokenId,
        userId: auth.user.id,
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    await prisma.token.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });

    return NextResponse.json({ message: "Token revoked" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to revoke token" },
      { status: 500 }
    );
  }
}