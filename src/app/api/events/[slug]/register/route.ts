import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, events, eventRegistrations } from "@/db";
import { and, eq } from "drizzle-orm";
import { id as genId } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  if (!session.user.approved) {
    return NextResponse.json(
      { error: "Your membership is still pending admin approval." },
      { status: 403 }
    );
  }

  const event = await db.query.events.findFirst({
    where: eq(events.slug, params.slug),
    with: { registrations: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  if (new Date(event.startDate) < new Date()) {
    return NextResponse.json(
      { error: "This event has already happened." },
      { status: 400 }
    );
  }

  const existing = event.registrations.find(
    (r) => r.userId === session.user.id
  );
  if (existing) {
    return NextResponse.json(
      { error: "You're already registered for this event." },
      { status: 409 }
    );
  }

  const confirmedCount = event.registrations.filter(
    (r) => r.status === "CONFIRMED"
  ).length;
  const isFull = event.capacity != null && confirmedCount >= event.capacity;

  await db.insert(eventRegistrations).values({
    id: genId(),
    eventId: event.id,
    userId: session.user.id,
    status: isFull ? "PENDING" : "CONFIRMED",
  });

  return NextResponse.json({
    ok: true,
    status: isFull ? "PENDING" : "CONFIRMED",
    message: isFull
      ? "Event is at capacity — you've been added to the waitlist."
      : "You're registered! See you there.",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const event = await db.query.events.findFirst({
    where: eq(events.slug, params.slug),
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  await db
    .delete(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, event.id),
        eq(eventRegistrations.userId, session.user.id)
      )
    );

  return NextResponse.json({ ok: true, message: "Registration cancelled." });
}
