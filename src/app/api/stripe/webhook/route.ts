import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();

  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.log("Webhook Error:", error);

    return new NextResponse("Invalid signature", {
      status: 400,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.metadata?.email;

      if (email) {
        const updated = await prisma.user.updateMany({
          where: {
            email,
          },
          data: {
            plan: "PRO",
          },
        });
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.log(error);

    return new NextResponse("Webhook handler failed", {
      status: 500,
    });
  }
}