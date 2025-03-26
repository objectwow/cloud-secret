import { SecretManager } from "../src";
import { GoogleProvider } from "../src/providers/google";

describe("SecretManager", () => {
  let secretManager: SecretManager;
  let googleProvider: GoogleProvider;
  beforeEach(() => {
    googleProvider = new GoogleProvider({
      projectId: "your-project-id",
      secretId: "your_secret_id",
    });

    secretManager = new SecretManager(googleProvider, {
      useCache: false,
      hashKey: "posn",
      debug: false,
    });
  });

  it("should return specific value in ENV", async () => {
    jest.spyOn(googleProvider as any, "getClient").mockReturnValue({
      accessSecretVersion: jest.fn().mockResolvedValue([
        {
          payload: {
            data: "PORT=3000\nVN=Việt nam",
          },
        },
      ]),
    });

    await secretManager.loadENV(["PORT", "VN"]);
    expect(process.env.PORT).toEqual("3000");
    expect(process.env.VN).toEqual("Việt nam");
  });
});
