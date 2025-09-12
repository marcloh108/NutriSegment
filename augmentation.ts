import dotenv from "dotenv";
dotenv.config({path: ".env.local"});
import { fal } from "@fal-ai/client";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// --- 1. Firebase Admin setup ---
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL!;
const FIREBASE_PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET!;

// Initialize Firebase Admin if not already
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    }),
    storageBucket: FIREBASE_STORAGE_BUCKET,
  });
}

// --- 2. fal.ai setup ---
fal.config({ credentials: process.env.FAL_KEY! });

async function main() {
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

  // 👇 Change to the actual file path inside your bucket
  const objectPath = "uploads/example.jpg";
  const file = bucket.file(objectPath);

  // Signed URL (valid 15 min)
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });
  console.log("Firebase signed URL:", signedUrl);

  // --- 3. Call Nano-Banana edit endpoint ---
  const result = await fal.subscribe("fal-ai/nano-banana/edit", {
    input: {
      image_url: signedUrl,
      prompt: "Raise camera ~30°, yaw +20° right, keep subject identity and colors.",
    },
  });

  const out = (result as any)?.images?.[0]?.url || (result as any)?.image?.url;
  if (!out) throw new Error("No output URL returned from Nano-Banana");
  console.log("Augmented viewpoint image:", out);
}

main().catch(console.error);
