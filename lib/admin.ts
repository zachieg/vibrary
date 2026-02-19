export function isAdmin(email?: string | null): boolean {
  return !!email && email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
}
