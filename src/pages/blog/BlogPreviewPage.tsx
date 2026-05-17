import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlog, publishBlog, unpublishBlog, type Blog } from "../../api/blog";

export default function BlogPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBlog(id)
      .then((res) => setBlog(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load post"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handlePublishToggle = async () => {
    if (!blog) return;
    setPublishLoading(true);
    try {
      const updated =
        blog.status === "published"
          ? await unpublishBlog(blog.id)
          : await publishBlog(blog.id);
      setBlog((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setPublishLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="spin"
            style={{ marginRight: 8 }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
          Loading post...
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="page">
        <div className="alert alert--error" style={{ maxWidth: 500 }}>
          {error || "Post not found"}
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/blog" className="btn btn--secondary btn--sm">
            Back to posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="preview-header">
        <Link to="/blog" className="btn btn--ghost btn--sm">
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 12H5M12 5l-7 7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div style={{ flex: 1 }} />
        <button
          className={`btn btn--sm ${blog?.status === "published" ? "btn--secondary" : "btn--primary"}`}
          onClick={handlePublishToggle}
          disabled={publishLoading}
        >
          {publishLoading
            ? "..."
            : blog?.status === "published"
              ? "Unpublish"
              : "Publish"}
        </button>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => navigate(`/blog/${id}/edit`)}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>

      <div className="preview-card">
        {blog.cover_image_url && (
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="preview-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        )}

        <div className="preview-meta">
          <span className={`badge badge--${blog.status}`}>
            {blog.status === "published" ? "Published" : "Draft"}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {formatDate(blog.created_at)}
          </span>
        </div>

        <h1 className="preview-title">{blog.title}</h1>

        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
}
