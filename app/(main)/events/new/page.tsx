import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="p-4">
      <EventForm mode="create" />
    </div>
  );
}
