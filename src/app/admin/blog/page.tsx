import Link from "next/link";
import { getAllBlogPostsAdmin } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";
import PostRowActions from "@/components/admin/post-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllBlogPostsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
          Blog ({posts.length})
        </h2>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-brz-red px-4 py-2 text-sm font-bold uppercase tracking-wide text-brz-ink hover:bg-brz-amber"
        >
          + New post
        </Link>
      </div>
      <p className="mt-1 text-sm text-brz-mute">
        Long-form stories and recaps, shown on the public Blog page.
      </p>

      <div className="mt-5 space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-brz-mute">No posts yet.</p>
        )}
        {posts.map((p) => (
          <div
            key={p.id}
            className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display font-semibold uppercase tracking-wide text-brz-white">
                  {p.title}
                </p>
                <span className="badge border border-brz-line text-brz-mute">
                  {p.status}
                </span>
              </div>
              <p className="text-xs text-brz-mute">
                {formatDate(p.publishedAt)}
                {p.author ? ` · by ${p.author.name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {p.status === "PUBLISHED" && (
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-sm text-brz-mute hover:text-brz-red"
                >
                  View
                </Link>
              )}
              <Link
                href={`/admin/blog/${p.id}/edit`}
                className="text-sm font-semibold text-brz-red hover:underline"
              >
                Edit
              </Link>
              <PostRowActions deleteUrl={`/api/admin/blog/${p.id}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
