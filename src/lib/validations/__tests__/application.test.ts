import { describe, it, expect } from "vitest";
import { applicationFormSchema } from "../application";

describe("applicationFormSchema", () => {
  // Valid test data
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    bio: "I am a creative professional with over 10 years of experience in various artistic fields.",
    location: "New York, USA",
    creativeInterests: "Painting, sculpture, and digital art",
    reasonForJoining: "I want to connect with fellow creatives and explore new places",
    profilePhotoUrl: "https://res.cloudinary.com/demo/image/upload/v1234/profile.jpg",
    homePhotos: [
      "https://res.cloudinary.com/demo/image/upload/v1234/home1.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1234/home2.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1234/home3.jpg",
    ],
  };

  describe("homePhotos validation", () => {
    it("accepts exactly 3 valid Cloudinary URLs (minimum)", () => {
      const result = applicationFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("accepts 10 valid Cloudinary URLs (maximum)", () => {
      const data = {
        ...validData,
        homePhotos: Array(10).fill("https://res.cloudinary.com/demo/image/upload/v1234/home.jpg"),
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects fewer than 3 photos", () => {
      const data = {
        ...validData,
        homePhotos: [
          "https://res.cloudinary.com/demo/image/upload/v1234/home1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1234/home2.jpg",
        ],
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const homePhotosError = result.error.issues.find(
          (issue) => issue.path[0] === "homePhotos"
        );
        expect(homePhotosError?.message).toBe("Please upload at least 3 photos of your home");
      }
    });

    it("rejects more than 10 photos", () => {
      const data = {
        ...validData,
        homePhotos: Array(11).fill("https://res.cloudinary.com/demo/image/upload/v1234/home.jpg"),
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const homePhotosError = result.error.issues.find(
          (issue) => issue.path[0] === "homePhotos"
        );
        expect(homePhotosError?.message).toBe("Maximum 10 photos allowed");
      }
    });

    it("rejects empty array", () => {
      const data = {
        ...validData,
        homePhotos: [],
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects non-Cloudinary URLs", () => {
      const data = {
        ...validData,
        homePhotos: [
          "https://res.cloudinary.com/demo/image/upload/v1234/home1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1234/home2.jpg",
          "https://example.com/malicious-image.jpg", // Non-Cloudinary URL
        ],
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const urlError = result.error.issues.find(
          (issue) => issue.path[0] === "homePhotos" && issue.path[1] === 2
        );
        expect(urlError?.message).toBe("Invalid photo URL - must be uploaded through our system");
      }
    });

    it("rejects invalid URL format", () => {
      const data = {
        ...validData,
        homePhotos: [
          "https://res.cloudinary.com/demo/image/upload/v1234/home1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1234/home2.jpg",
          "not-a-valid-url",
        ],
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects HTTP URLs (requires HTTPS)", () => {
      const data = {
        ...validData,
        homePhotos: [
          "http://res.cloudinary.com/demo/image/upload/v1234/home1.jpg", // HTTP instead of HTTPS
          "https://res.cloudinary.com/demo/image/upload/v1234/home2.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1234/home3.jpg",
        ],
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("profilePhotoUrl validation", () => {
    it("accepts valid Cloudinary URL", () => {
      const result = applicationFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects non-Cloudinary URL", () => {
      const data = {
        ...validData,
        profilePhotoUrl: "https://example.com/photo.jpg",
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("text field validation", () => {
    it("trims whitespace from name", () => {
      const data = {
        ...validData,
        name: "  John Doe  ",
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
      }
    });

    it("normalizes email to lowercase", () => {
      const data = {
        ...validData,
        email: "JOHN@EXAMPLE.COM",
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("rejects bio with fewer than 50 characters", () => {
      const data = {
        ...validData,
        bio: "Too short",
      };
      const result = applicationFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
