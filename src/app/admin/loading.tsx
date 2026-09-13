import Spinner from "@/components/spinner";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="4em" />
    </div>
  );
}
