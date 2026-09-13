import Spinner from "@/components/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="5em" />
    </div>
  );
}
