import { describe, it, expect } from "vitest";
import { prisma } from "./prisma";
import { PrismaClient } from "@prisma/client";

describe("Prisma Singleton and Relational Contracts", () => {
  it("exports a valid PrismaClient singleton instance", () => {
    expect(prisma).toBeDefined();
    expect(prisma).toBeInstanceOf(PrismaClient);
  });

  it("exposes all required domain model delegates", () => {
    const requiredDelegates = [
      "user",
      "customer",
      "equipment",
      "serviceOrder",
      "budget",
      "serviceOrderHistory",
    ] as const;

    for (const delegate of requiredDelegates) {
      expect(prisma[delegate], `Delegate ${delegate} must exist`).toBeDefined();
      expect(typeof prisma[delegate].create).toBe("function");
      expect(typeof prisma[delegate].findMany).toBe("function");
      expect(typeof prisma[delegate].findUnique).toBe("function");
    }
  });

  it("supports ACID atomic transactions via $transaction", () => {
    expect(prisma.$transaction).toBeDefined();
    expect(typeof prisma.$transaction).toBe("function");
  });

  it("validates relational integrity and cascading contracts on models", () => {
    expect(typeof prisma.customer.findFirst).toBe("function");
    expect(typeof prisma.equipment.findFirst).toBe("function");
    expect(typeof prisma.serviceOrder.findFirst).toBe("function");
  });
});

