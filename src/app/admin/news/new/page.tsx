import NewsForm from "@/components/admin/news-form";

export default function NewNewsPostPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        New news item
      </h2>
      <NewsForm />
    </div>
  );
}
