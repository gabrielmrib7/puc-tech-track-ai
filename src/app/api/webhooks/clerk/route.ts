import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { syncClerkUser } from "@/modules/auth/application/sync-clerk-user";

export const dynamic = "force-dynamic";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
  };
};

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  const headerStore = headers();
  const svixHeaders = {
    "svix-id": headerStore.get("svix-id") ?? "",
    "svix-timestamp": headerStore.get("svix-timestamp") ?? "",
    "svix-signature": headerStore.get("svix-signature") ?? "",
  };

  try {
    const event = new Webhook(secret).verify(await request.text(), svixHeaders) as ClerkWebhookEvent;
    if (event.type !== "user.created" && event.type !== "user.updated") {
      return NextResponse.json({ received: true });
    }

    const email = event.data.email_addresses?.[0]?.email_address;
    if (!email) return NextResponse.json({ error: "User email is required" }, { status: 422 });

    await syncClerkUser(prisma, {
      clerkId: event.data.id,
      email,
      name: [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") || email,
    });

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
}
