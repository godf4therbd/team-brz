import { getPublishedNewsPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const posts = await getPublishedNewsPosts();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-brz-white">
        News
      </h1>
      <p className="mt-1 text-brz-mute">
        Quick announcements and links from the club.
      </p>

      <div className="mt-8 space-y-4">
        {posts.length === 0 && (
          <p className="text-brz-mute">No news yet — check back soon.</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-brz-mute">
              {formatDate(p.publishedAt)}
              {p.author ? ` · ${p.author.name}` : ""}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-brz-white">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-brz-white/90">{p.body}</p>
            {p.sourceUrl && (
              <a
                href={p.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-2 inline-block text-sm font-semibold text-brz-red hover:underline"
              >
                Read more →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
