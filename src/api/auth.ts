import { apiRequest } from "./client";

export type LoginPayload = {
  email_address: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  username: string;
  expires_at: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export const login = (payload: LoginPayload) =>
  apiRequest<AuthResponse>("/session", { method: "POST", body: payload });

export const signup = (payload: SignupPayload) =>
  apiRequest<AuthResponse>("/auth/signup", { method: "POST", body: payload });
