import { notFound } from "next/navigation";
import { getNewsPostByIdAdmin } from "@/lib/admin-queries";
import NewsForm from "@/components/admin/news-form";

export const dynamic = "force-dynamic";

export default async function EditNewsPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getNewsPostByIdAdmin(params.id);
  if (!post) notFound();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        Edit news item
      </h2>
      <NewsForm
        postId={post.id}
        initial={{
          title: post.title,
          body: post.body,
          sourceUrl: post.sourceUrl,
          status: post.status,
        }}
      />
    </div>
  );
}
