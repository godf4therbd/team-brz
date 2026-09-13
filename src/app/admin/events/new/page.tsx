import EventForm from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        New event
      </h2>
      <EventForm />
    </div>
  );
}
