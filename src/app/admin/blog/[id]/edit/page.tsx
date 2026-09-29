import { notFound } from "next/navigation";
import { getBlogPostByIdAdmin } from "@/lib/admin-queries";
import BlogForm from "@/components/admin/blog-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getBlogPostByIdAdmin(params.id);
  if (!post) notFound();

  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        Edit blog post
      </h2>
      <BlogForm
        postId={post.id}
        initial={{
          title: post.title,
          coverImage: post.coverImage,
          body: post.body,
          status: post.status,
        }}
      />
    </div>
  );
}
