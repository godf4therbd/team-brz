import { db, events } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/event-form";
import { parsePhotos } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await db.query.events.findFirst({
    where: eq(events.id, params.id),
  });
  if (!event) notFound();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        Edit event
      </h2>
      <EventForm
        eventId={event.id}
        initial={{ ...event, photos: parsePhotos(event.photos) }}
      />
    </div>
  );
}
