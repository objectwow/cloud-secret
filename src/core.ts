import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { BaseProvider } from "./providers/base";

const CACHE_PATH = path.join(__dirname, "../.cache");

export interface SecretManagerConfig {
  envPath?: string;
  useCache?: boolean;
  hashKey?: string;
  debug?: boolean | string;
  enable?: boolean | string;
}

export class SecretManager {
  private secretProvider: BaseProvider;
  private secretENVPath: string;
  private removeSecretScriptPath: string;
  private useCache: boolean = true;
  private hashKey: string;
  private debug: boolean | string = true;
  private enable: boolean | string = true;

  /**
   * Creates an instance of SecretManager.
   * @param provider A provider class that implements {@link BaseProvider}
   * @param config An options object that can contain the following properties:
   * - enable: A boolean indicating whether to enable the secret manager or not. Default is true.
   * - useCache: A boolean indicating whether to use file cache or not. Default is true.
   * - envPath: A string indicating a path to store environment variables in a file. Default is ${CACHE_PATH}/.env.secret.
   * - hashKey: A string indicating the hash key to encrypt and decrypt secret values. Leave it blank if you don't want to encrypt secret values.
   * - debug: A boolean indicating whether to print debug message or not. Default is true.
   */
  constructor(provider: BaseProvider, config: SecretManagerConfig = {}) {
    this.secretProvider = provider;

    if (config?.useCache === false) {
      this.useCache = false;
    }

    if (config?.envPath) {
      this.secretENVPath = config.envPath;
    } else {
      this.secretENVPath = `${CACHE_PATH}/.env.secret`;
    }

    this.removeSecretScriptPath = `${CACHE_PATH}/remove-secret.sh`;
    this.hashKey = config.hashKey;
    this.debug = config.debug ?? true;
    this.enable = config.enable ?? true;
  }

  /**
   * Retrieves a secret from either the cache or the provider.
   * @param keys A list of secret keys to retrieve
   * @returns A Promise that resolves to an object with the requested secret values
   * @private
   */
  private async getSecret(keys: string[]) {
    const cached = await this.getSecretFromCache();
    if (cached && keys.every((key) => cached[key])) {
      return cached;
    }

    this.debug && console.info("Getting secret from provider");
    const secret = await this.secretProvider.getSecret(keys);
    const filteredSecret = keys.reduce(
      (acc: Record<string, unknown>, key: string) => {
        acc[key] = secret[key];
        return acc;
      },
      {}
    );
    await this.setSecretToCache(filteredSecret);
    return filteredSecret;
  }

  /**
   * Retrieves a secret from cache
   * @returns A Promise that resolves to an object with the requested secret values or null if the cache is disabled or the secret is not found
   * @private
   */
  private async getSecretFromCache() {
    try {
      if (!this.useCache) {
        return null;
      }

      const data = await fs.readFile(this.secretENVPath, "utf8");
      const secret = data
        .split("\n")
        .map((line) => line.split("="))
        .reduce((acc: Record<string, unknown>, [key, value]) => {
          acc[key] = this.decrypt(value);
          return acc;
        }, {});

      return secret;
    } catch (e) {
      if (e?.code === "ERR_OSSL_BAD_DECRYPT") {
        this.debug &&
          console.info("Secret is encrypted with different hashKey");
      }

      if (e?.code === "ENOENT") {
        this.debug && console.info("Secret not found in cache");
      }

      return null;
    }
  }

  /**
   * Saves the given secret to the cache by writing it to a file.
   * If caching is disabled, the function returns immediately without performing any operations.
   * Creates the cache directory if it doesn't exist.
   * Encrypts each secret value before writing it to the file, using the configured hash key.
   * Also writes a shell script to remove the secret file if it exists.
   * Logs debug information if debugging is enabled.
   *
   * @param secret An object containing the secret key-value pairs to be cached.
   * @private
   */

  private async setSecretToCache(secret: Record<string, unknown>) {
    if (!this.useCache) {
      return;
    }
    this.debug && console.info("Setting secret to cache...");

    await fs.mkdir(CACHE_PATH, { recursive: true });

    const data = Object.entries(secret)
      .map(([key, value]) => `${key}=${this.encrypt(value)}`)
      .join("\n");

    await Promise.all([
      fs.writeFile(this.secretENVPath, data, "utf8"),
      fs.writeFile(
        `${this.removeSecretScriptPath}`,
        `
if [ -f "${this.secretENVPath}" ]; then
  rm "${this.secretENVPath}"
fi`,
        "utf8"
      ),
    ]);
    this.debug && console.info("Secret has been set to cache");
  }

  /**
   * Encrypts a value using AES-256-CBC algorithm with a given hash key.
   * If the hash key is not provided, the function returns the value as is.
   * If the value is null or undefined, the function returns the value as is.
   * Otherwise, the function encrypts the value and returns a string in the format of
   * `<iv><encrypted_value>`, where `<iv>` is the initialization vector as a 32-character
   * hexadecimal string and `<encrypted_value>` is the encrypted value as a hexadecimal string.
   * @param value The value to be encrypted
   * @returns The encrypted value as a string
   */
  private encrypt(value: any) {
    if (!this.hashKey) {
      return value;
    }

    if (value === null || value === undefined) {
      return value;
    }

    value = value.toString();

    const key = crypto.createHash("sha256").update(this.hashKey).digest();
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + encrypted; // Prepend IV for decryption
  }

  /**
   * Decrypts a value that was previously encrypted by this class.
   * The value must be a string in the format of `<iv><encrypted_value>`,
   * where `<iv>` is the initialization vector as a 32-character hexadecimal string
   * and `<encrypted_value>` is the encrypted value as a hexadecimal string.
   * If the hash key is not provided, the function returns the value as is.
   * Otherwise, the function decrypts the value and returns the decrypted value as a string.
   * @param value The value to be decrypted
   * @returns The decrypted value as a string
   */
  private decrypt(value: string) {
    if (!this.hashKey) {
      return value;
    }

    const key = crypto.createHash("sha256").update(this.hashKey).digest();
    const iv = Buffer.from(value.slice(0, 32), "hex"); // Extract IV
    const encryptedText = value.slice(32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Loads the given secret keys into the process's environment variables.
   * If the secret manager is disabled, this function returns immediately without performing any operations.
   * If `keys` is empty, this function returns immediately without performing any operations.
   * Otherwise, this function retrieves the secret values for the given keys and sets them to the corresponding environment variables.
   * If a key is not found in the secret store, the corresponding environment variable is not set.
   * @param keys An array of secret keys to be loaded into the environment variables.
   * @returns A Promise that resolves to void.
   */
  async loadENV(keys: string[]): Promise<void> {
    if (!this.enable || !keys?.length) {
      return;
    }

    // Get secret
    const secret = await this.getSecret(keys);
    // Set secret to process.env
    Object.entries(secret).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value as string;
      }
    });

    return;
  }
}
