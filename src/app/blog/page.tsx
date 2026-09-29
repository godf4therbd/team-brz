import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-brz-white">
        Blog
      </h1>
      <p className="mt-1 text-brz-mute">
        Stories, recaps, and updates from the club.
      </p>

      <div className="mt-8 space-y-6">
        {posts.length === 0 && (
          <p className="text-brz-mute">No posts yet — check back soon.</p>
        )}
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="card flex flex-col gap-4 overflow-hidden p-0 transition hover:border-brz-red sm:flex-row"
          >
            {p.coverImage && (
              <div className="h-48 shrink-0 overflow-hidden sm:h-auto sm:w-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-brz-mute">
                {formatDate(p.publishedAt)}
                {p.author ? ` · ${p.author.name}` : ""}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-brz-mute">
                {p.body}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
