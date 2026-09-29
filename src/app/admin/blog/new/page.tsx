import BlogForm from "@/components/admin/blog-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-brz-white">
        New blog post
      </h2>
      <BlogForm />
    </div>
  );
}
