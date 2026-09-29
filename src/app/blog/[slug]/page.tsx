import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <Link href="/blog" className="text-sm text-brz-mute hover:text-brz-red">
        ← Back to blog
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-wide text-brz-white md:text-4xl">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-brz-mute">
        {formatDate(post.publishedAt)}
        {post.author ? ` · by ${post.author.name}` : ""}
      </p>

      {post.coverImage && (
        <div className="card mt-6 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      )}

      <div className="mt-6 whitespace-pre-line text-brz-white/90">
        {post.body}
      </div>
    </div>
  );
}
