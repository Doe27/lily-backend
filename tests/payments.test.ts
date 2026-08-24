import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("payment quote endpoint", () => {
  const app = createApp();

  const validPayload = {
    fromWalletId: "wallet_abc123",
    toAddress: "GDXYZSTELLARADDRESS1234567890ABCDEFGHIJKL",
    amount: "10.5",
    assetCode: "USDC",
  };

  it("returns a typed quote response for valid input", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      fromWalletId: validPayload.fromWalletId,
      toAddress: validPayload.toAddress,
      amount: validPayload.amount,
      assetCode: validPayload.assetCode,
      estimatedFee: expect.any(String),
      estimatedTotal: validPayload.amount,
    });
    expect(response.body.data.quoteId).toMatch(/^quote_/);
    expect(response.body.data.expiresAt).toBeDefined();
    expect(response.body.data.createdAt).toBeDefined();
  });

  it("rejects missing fromWalletId with a 400", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send({
        toAddress: validPayload.toAddress,
        amount: validPayload.amount,
        assetCode: validPayload.assetCode,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
  });

  it("rejects missing toAddress with a 400", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send({
        fromWalletId: validPayload.fromWalletId,
        amount: validPayload.amount,
        assetCode: validPayload.assetCode,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
  });

  it("rejects invalid amount format with a 400", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send({
        ...validPayload,
        amount: "not-a-number",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
  });

  it("rejects empty assetCode with a 400", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send({
        ...validPayload,
        assetCode: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
  });

  it("rejects completely empty payload with a 400", async () => {
    const response = await request(app)
      .post("/api/v1/payments/quote")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request validation failed");
    expect(response.body.details.fieldErrors).toBeDefined();
  });
});
