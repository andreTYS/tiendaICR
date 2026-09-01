/**
 * TDD: login use case — RED phase
 * Tests written BEFORE implementation.
 * Mocks both UserRepository and PasswordHasher ports.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { UserRepository } from "../domain/user-repository";
import type { PasswordHasher } from "../domain/password-hasher";
import type { User } from "../domain/user";

// Will import once implemented
// import { login } from "./login";

const mockUser: User = {
  id: "cuid-123",
  email: "admin@example.com",
  passwordHash: "hashed-password",
  role: "ADMIN",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRepo(user: User | null = mockUser): UserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(user),
    findById: vi.fn().mockResolvedValue(user),
    create: vi.fn(),
    list: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
    countByRole: vi.fn().mockResolvedValue(1),
  };
}

function makeHasher(verifyResult = true): PasswordHasher {
  return {
    hash: vi.fn().mockResolvedValue("hashed"),
    verify: vi.fn().mockResolvedValue(verifyResult),
  };
}

describe("login use case", () => {
  let login: typeof import("./login").login;

  beforeEach(async () => {
    const mod = await import("./login");
    login = mod.login;
  });

  it("returns user data on valid credentials", async () => {
    const result = await login(
      { email: "admin@example.com", password: "secret-pass" },
      { users: makeRepo(), hasher: makeHasher(true) }
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("cuid-123");
      expect(result.value.email).toBe("admin@example.com");
      expect(result.value.role).toBe("ADMIN");
    }
  });

  it("returns INVALID_CREDENTIALS when user does not exist", async () => {
    const result = await login(
      { email: "nobody@example.com", password: "secret-pass" },
      { users: makeRepo(null), hasher: makeHasher(true) }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_CREDENTIALS");
    }
  });

  it("returns INVALID_CREDENTIALS when password is wrong", async () => {
    const result = await login(
      { email: "admin@example.com", password: "wrong-pass" },
      { users: makeRepo(), hasher: makeHasher(false) }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("INVALID_CREDENTIALS");
    }
  });

  it("returns VALIDATION when email is malformed", async () => {
    const result = await login(
      { email: "not-an-email", password: "secret-pass" },
      { users: makeRepo(), hasher: makeHasher(true) }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("VALIDATION");
    }
  });

  it("returns VALIDATION when password is empty", async () => {
    const result = await login(
      { email: "admin@example.com", password: "" },
      { users: makeRepo(), hasher: makeHasher(true) }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("VALIDATION");
    }
  });

  it("does NOT call the repository when validation fails", async () => {
    const repo = makeRepo();
    await login(
      { email: "bad-email", password: "pass" },
      { users: repo, hasher: makeHasher() }
    );

    expect(repo.findByEmail).not.toHaveBeenCalled();
  });

  it("does NOT call hasher when user is not found (timing safety)", async () => {
    const hasher = makeHasher(false);
    await login(
      { email: "nobody@example.com", password: "pass" },
      { users: makeRepo(null), hasher }
    );

    // hasher.verify should NOT be called — fail fast on missing user
    expect(hasher.verify).not.toHaveBeenCalled();
  });
});
