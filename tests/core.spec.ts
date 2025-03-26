import { SecretManager } from "../src";
import { BaseProvider } from "../src/providers/base";
import * as path from "path";
import { exec } from "child_process";

describe("SecretManager Core with no Cache", () => {
  let secretManager: SecretManager;
  let provider: BaseProvider;
  beforeEach(() => {
    class Provider extends BaseProvider {
      async getSecret(keys: string[]): Promise<Record<string, unknown>> {
        return {};
      }
    }

    provider = new Provider();

    secretManager = new SecretManager(provider, {
      useCache: false,
      debug: false,
    });
  });

  it("should return specific value in ENV", async () => {
    jest
      .spyOn(provider, "getSecret")
      .mockResolvedValue({ PORT: "3000", VN: "Việt nam", BOO: true, NUM: 123 });

    await secretManager.loadENV(["PORT", "VN", "BOO", "NUM"]);
    expect(process.env.PORT).toEqual("3000");
    expect(process.env.VN).toEqual("Việt nam");
    expect(process.env.BOO).toEqual("true");
    expect(process.env.NUM).toEqual("123");
  });
});

describe("SecretManager Core with Cache", () => {
  let secretManager: SecretManager;
  let provider: BaseProvider;
  beforeEach(() => {
    class Provider extends BaseProvider {
      async getSecret(keys: string[]): Promise<Record<string, unknown>> {
        return {};
      }
    }

    provider = new Provider();

    secretManager = new SecretManager(provider, {
      useCache: true,
      debug: false,
      hashKey: "your_hash_key",
    });
  });

  afterAll(() => {
    exec(
      `bash "${path.join(__dirname, "../clear-cache.sh")}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Script stderr: ${stderr}`);
          return;
        }
      }
    );
  });

  it("should return specific value in ENV", async () => {
    jest.spyOn(provider, "getSecret").mockResolvedValue({
      PORT: "3000",
      VN: "Việt nam",
      BOO: true,
      NUM: 123,
      LONG: "this is a long string to test the cache function with a long value in the secret data that is longer than 100 characters",
    });

    await secretManager.loadENV(["PORT", "VN", "BOO", "NUM", "LONG"]);
    expect(process.env.PORT).toEqual("3000");
    expect(process.env.VN).toEqual("Việt nam");
    expect(process.env.BOO).toEqual("true");
    expect(process.env.NUM).toEqual("123");
  });
});
