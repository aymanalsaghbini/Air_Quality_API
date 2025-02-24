export interface JwtPayload {
  sub: string; // The user ID or subject
  email: string;
  role: string;
}
