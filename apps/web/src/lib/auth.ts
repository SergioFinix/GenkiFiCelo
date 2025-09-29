"use server";

import { VerifyLoginPayloadParams, createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "./thirdweb/client";
import { cookies } from "next/headers";

const privateKey = process.env.AUTH_PRIVATE_KEY || "";
const authDomain = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "localhost:3000";

if (!privateKey) {
  throw new Error("Missing AUTH_PRIVATE_KEY in .env file.");
}

const thirdwebAuth = createAuth({
  domain: authDomain,
  adminAccount: privateKeyToAccount({ client, privateKey }),
  client: client,
});

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams) {
  console.log("🔐 Attempting login with payload:", payload);
  
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  
  if (verifiedPayload.valid) {
    console.log("✅ Payload verified, generating JWT");
    
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    
    // Configurar cookies para móvil
    cookies().set("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Importante para móvil
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });
    
    console.log("✅ JWT cookie set successfully");
  } else {
    console.log("❌ Payload verification failed");
  }
}

export async function isLoggedIn() {
  const jwt = cookies().get("jwt");
  
  if (!jwt?.value) {
    console.log("❌ No JWT cookie found");
    return false;
  }
  
  try {
    const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
    console.log("🔍 JWT verification result:", authResult.valid);
    return authResult.valid;
  } catch (error) {
    console.error("❌ JWT verification error:", error);
    return false;
  }
}

export async function logout() {
  console.log("👋 Logging out user");
  cookies().delete("jwt");
}
