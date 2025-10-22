/**
 * @jest-environment node
 */

import { GET, POST } from "@/app/api/consent/route";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";

jest.mock("@/lib/auth");
jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    consent: {
      upsert: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

describe("Consent API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/consent", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return consents for existing user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        username: "testuser",
        consents: {
          emailOptIn: true,
          privacyConsentAt: new Date("2025-01-01"),
          tosAcceptedAt: new Date("2025-01-01"),
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("consents");
      expect(data.consents).toMatchObject({
        emailOptIn: true,
      });
    });

    it("should create user if not exists", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          username: "newuser",
          name: "New User",
          email: "new@example.com",
          image: "https://github.com/avatar.jpg",
        },
        expires: "2025-12-31",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue({
        id: "user-2",
        username: "newuser",
        consents: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          githubId: "github_newuser",
          username: "newuser",
          name: "New User",
          email: "new@example.com",
          avatarUrl: "https://github.com/avatar.jpg",
          emailVerifiedAt: expect.any(Date),
        },
        include: { consents: true },
      });

      expect(response.status).toBe(200);
      expect(data.consents).toBeNull();
    });
  });

  describe("POST /api/consent", () => {
    it("should return 401 if not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const req = new Request("http://localhost/api/consent", {
        method: "POST",
        body: JSON.stringify({ emailOptIn: true }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should upsert consent for existing user", async () => {
      mockGetServerSession.mockResolvedValue({
        user: { username: "testuser" },
        expires: "2025-12-31",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        username: "testuser",
      });

      (db.consent.upsert as jest.Mock).mockResolvedValue({
        id: "consent-1",
        userId: "user-1",
        emailOptIn: true,
        privacyConsentAt: new Date(),
        tosAcceptedAt: new Date(),
      });

      const req = new Request("http://localhost/api/consent", {
        method: "POST",
        body: JSON.stringify({
          emailOptIn: true,
          acceptPrivacy: true,
          acceptTos: true,
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("consents");
      expect(db.consent.upsert).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        update: expect.objectContaining({
          emailOptIn: true,
        }),
        create: expect.objectContaining({
          userId: "user-1",
          emailOptIn: true,
        }),
      });
    });

    it("should create user if not exists before upserting consent", async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          username: "newuser",
          name: "New User",
          email: null,
          image: null,
        },
        expires: "2025-12-31",
      });

      (db.user.findUnique as jest.Mock).mockResolvedValue(null);
      (db.user.create as jest.Mock).mockResolvedValue({
        id: "user-2",
        username: "newuser",
      });

      (db.consent.upsert as jest.Mock).mockResolvedValue({
        id: "consent-2",
        userId: "user-2",
        emailOptIn: false,
        privacyConsentAt: new Date(),
        tosAcceptedAt: new Date(),
      });

      const req = new Request("http://localhost/api/consent", {
        method: "POST",
        body: JSON.stringify({
          emailOptIn: false,
          acceptPrivacy: true,
          acceptTos: true,
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(db.user.create).toHaveBeenCalled();
      expect(db.consent.upsert).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data.consents).toMatchObject({
        emailOptIn: false,
      });
    });
  });
});
