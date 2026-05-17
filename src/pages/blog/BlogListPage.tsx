import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getBlogs,
  deleteBlog,
  publishBlog,
  unpublishBlog,
  type Blog,
  type Pagination,
} from "../../api/blog";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const navigate = useNavigate();

  const fetchBlogs = async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const { data, pagination: pg } = await getBlogs(p);
      setBlogs(data);
      setPagination(pg);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => void fetchBlogs(page));
  }, [page]);

  const handlePublishToggle = async (blog: Blog) => {
    setPublishingIds((prev) => new Set(prev).add(blog.id));
    try {
      const updated =
        blog.status === "published"
          ? await unpublishBlog(blog.id)
          : await publishBlog(blog.id);
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? updated : b)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setPublishingIds((prev) => {
        const next = new Set(prev);
        next.delete(blog.id);
        return next;
      });
    }
  };

  const handleDelete = async (blog: Blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`))
      return;
    try {
      await deleteBlog(blog.id);
      const remaining = blogs.length - 1;
      if (remaining === 0 && page > 1) {
        setPage((p) => p - 1);
      } else {
        void fetchBlogs(page);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Blog Posts</h1>
        <Link to="/blog/new" className="btn btn--primary">
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Post
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading && (
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
            Loading posts...
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: 24 }}>
            <div className="alert alert--error" style={{ marginBottom: 16 }}>
              {error}
            </div>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => fetchBlogs(page)}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="empty-state">
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              style={{ margin: "0 auto 16px", display: "block", opacity: 0.2 }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3>No posts yet</h3>
            <p>Get started by creating your first blog post.</p>
            <Link to="/blog/new" className="btn btn--primary">
              Create first post
            </Link>
          </div>
        )}

        {!loading && !error && pagination && (
          <div className="pagination">
            <span className="pagination__count">
              {pagination.total_count} post
              {pagination.total_count !== 1 ? "s" : ""}
            </span>
            <div className="pagination__controls">
              <button
                className="btn btn--ghost btn--sm"
                disabled={pagination.prev_page === null}
                onClick={() => setPage(pagination.prev_page!)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {Array.from(
                { length: pagination.total_pages },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  className={`btn btn--sm ${p === pagination.current_page ? "btn--primary" : "btn--ghost"}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn btn--ghost btn--sm"
                disabled={pagination.next_page === null}
                onClick={() => setPage(pagination.next_page!)}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="td-cover">Cover</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="td-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="td-cover">
                      {blog.cover_image_url ? (
                        <img
                          src={blog.cover_image_url}
                          alt=""
                          className="cover-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="cover-placeholder">
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="blog-title">{blog.title}</div>
                      <div className="blog-date">
                        {formatDate(blog.created_at)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge--${blog.status}`}>
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td
                      style={{ color: "var(--text-secondary)", fontSize: 13 }}
                    >
                      {formatDate(blog.updated_at)}
                    </td>
                    <td className="td-actions">
                      <div className="actions">
                        <button
                          className="btn btn--ghost btn--sm"
                          title={
                            blog.status === "published"
                              ? "Unpublish"
                              : "Publish"
                          }
                          disabled={publishingIds.has(blog.id)}
                          onClick={() => handlePublishToggle(blog)}
                        >
                          {publishingIds.has(blog.id) ? (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              className="spin"
                            >
                              <path
                                d="M21 12a9 9 0 1 1-6.219-8.56"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : blog.status === "published" ? (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M17 1l4 4-4 4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M3 11V9a4 4 0 0 1 4-4h14"
                                strokeLinecap="round"
                              />
                              <path
                                d="M7 23l-4-4 4-4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M21 13v2a4 4 0 0 1-4 4H3"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <polyline
                                points="22 12 18 12 15 21 9 3 6 12 2 12"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          title="Preview"
                          onClick={() => navigate(`/blog/${blog.id}/preview`)}
                        >
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          title="Edit"
                          onClick={() => navigate(`/blog/${blog.id}/edit`)}
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
                        </button>
                        <button
                          className="btn btn--ghost btn--sm btn--danger-ghost"
                          title="Delete"
                          onClick={() => handleDelete(blog)}
                        >
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
