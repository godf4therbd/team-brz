import PageLoader from "@/components/page-loader";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6">
      <PageLoader />
      <p className="font-display text-xs uppercase tracking-widest text-brz-mute">
        Loading
      </p>
    </div>
  );
}
