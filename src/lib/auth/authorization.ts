import { getCurrentUser } from "./session";

export type AuthorizationResult =
  | {
      authorized: true;
      user: NonNullable<
        Awaited<ReturnType<typeof getCurrentUser>>
      >;
    }
  | {
      authorized: false;
      status: 401 | 403;
      error: string;
    };

export async function requireAuthenticatedUser(): Promise<AuthorizationResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized.",
    };
  }

  return {
    authorized: true,
    user,
  };
}

export async function requireAdmin(): Promise<AuthorizationResult> {
  const result = await requireAuthenticatedUser();

  if (!result.authorized) {
    return result;
  }

  if (
    result.user.role !== "admin" &&
    result.user.role !== "super_admin"
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden.",
    };
  }

  return result;
}

export async function requireSuperAdmin(): Promise<AuthorizationResult> {
  const result = await requireAuthenticatedUser();

  if (!result.authorized) {
    return result;
  }

  if (result.user.role !== "super_admin") {
    return {
      authorized: false,
      status: 403,
      error: "Super Admin access required.",
    };
  }

  return result;
}
