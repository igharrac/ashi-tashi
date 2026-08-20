import { describe, expect, it } from "vitest";
import { mintShareToken, verifyShareToken } from "@/lib/shareLink";

const SECRET = "test-secret-niet-echt-gebruiken";

describe("shareLink", () => {
  it("een vers gegenereerd token is geldig", async () => {
    const { token } = await mintShareToken(SECRET);
    const result = await verifyShareToken(token, SECRET);
    expect(result.valid).toBe(true);
  });

  it("een verlopen token (negatieve ttl) is ongeldig", async () => {
    const { token } = await mintShareToken(SECRET, -1000);
    const result = await verifyShareToken(token, SECRET);
    expect(result.valid).toBe(false);
  });

  it("een token geverifieerd met het verkeerde secret is ongeldig", async () => {
    const { token } = await mintShareToken(SECRET);
    const result = await verifyShareToken(token, "ander-secret");
    expect(result.valid).toBe(false);
  });

  it("een geknoeid (aangepast) token is ongeldig", async () => {
    const { token } = await mintShareToken(SECRET);
    const tampered = `${token}x`;
    const result = await verifyShareToken(tampered, SECRET);
    expect(result.valid).toBe(false);
  });

  it("rommelige invoer geeft nooit een fout, alleen valid:false", async () => {
    await expect(verifyShareToken("niet-een-echt-token", SECRET)).resolves.toEqual({ valid: false });
    await expect(verifyShareToken("", SECRET)).resolves.toEqual({ valid: false });
    await expect(verifyShareToken("a.b.c", SECRET)).resolves.toEqual({ valid: false });
  });
});
