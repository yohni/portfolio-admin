import { apiRequest } from "./client";

export type BlogStatus = "draft" | "published";

export type Blog = {
  id: string;
  title: string;
  content: string;
  cover_image_url: string;
  status: BlogStatus;
  created_at: string;
  updated_at: string;
};

export type BlogPayload = {
  title: string;
  content: string;
  cover_image_url: string;
};

export type Pagination = {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_count: number;
};

export const getBlogs = (page = 1) =>
  apiRequest<{ data: Blog[]; pagination: Pagination }>(`/posts?page=${page}`);

export const getBlog = (id: string) =>
  apiRequest<{ data: Blog }>(`/posts/${id}`);

export const createBlog = (payload: BlogPayload) =>
  apiRequest<Blog>("/posts", { method: "POST", body: payload });

export const updateBlog = (id: string, payload: BlogPayload) =>
  apiRequest<Blog>(`/posts/${id}`, { method: "PUT", body: payload });

export const deleteBlog = (id: string) =>
  apiRequest<void>(`/posts/${id}`, { method: "DELETE" });

export const publishBlog = (id: string) =>
  apiRequest<Blog>(`/posts/${id}/publish`, { method: "PATCH" });

export const unpublishBlog = (id: string) =>
  apiRequest<Blog>(`/posts/${id}/unpublish`, { method: "PATCH" });
