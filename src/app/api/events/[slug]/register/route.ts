import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, events, eventRegistrations } from "@/db";
import { and, count, eq } from "drizzle-orm";
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

  // The capacity check and the insert used to be two separate steps (read
  // the current count, then decide CONFIRMED vs PENDING, then write) with
  // a gap in between where two people registering at the same instant
  // could both read "one spot left" and both get seated, overfilling the
  // event. Doing the read and the write inside one transaction closes
  // that gap — SQLite/libSQL serializes writers, so the count a second
  // concurrent request sees can't be stale.
  const registrationStatus = await db.transaction(async (tx) => {
    const existing = await tx.query.eventRegistrations.findFirst({
      where: and(
        eq(eventRegistrations.eventId, event.id),
        eq(eventRegistrations.userId, session.user.id)
      ),
    });
    if (existing) {
      return "ALREADY_REGISTERED" as const;
    }

    const [{ value: confirmedCount }] = await tx
      .select({ value: count() })
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, event.id),
          eq(eventRegistrations.status, "CONFIRMED")
        )
      );
    const isFull = event.capacity != null && confirmedCount >= event.capacity;
    const status = isFull ? "PENDING" : "CONFIRMED";

    await tx.insert(eventRegistrations).values({
      id: genId(),
      eventId: event.id,
      userId: session.user.id,
      status,
    });

    return status;
  });

  if (registrationStatus === "ALREADY_REGISTERED") {
    return NextResponse.json(
      { error: "You're already registered for this event." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: registrationStatus,
    message:
      registrationStatus === "PENDING"
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
