import { BaseProvider } from "./base";

export interface GoogleProviderConfig {
  projectId: string;
  secretId: string;
  version?: string;
}

export class GoogleProvider extends BaseProvider {
  private config: GoogleProviderConfig;
  private opts?: any;

  /**
   *
   * @param config
   * @param authOptions GoogleAuthOptions - Check at document https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#creating-the-client-instance
   *
   * @example
   * ```typescript
   * const googleProvider = new GoogleProvider({
   * 	projectId: 'your-project-id',
   * 	secretId: 'your_secret_id',
   * }. {
   * 	projectId: 'your-project-id',
   * 	credentials: {
   * 		client_email: 'your-client-email',
   * 		private_key: 'your-private'
   * });
   * ```
   */
  constructor(config: GoogleProviderConfig, authOptions?: any) {
    super();
    this.config = config;
    this.opts = authOptions;
    if (!this.config.version) {
      this.config.version = "latest";
    }
  }

  private getClient() {
    try {
      // lazy load
      const secretManager = require("@google-cloud/secret-manager");

      const { SecretManagerServiceClient } = secretManager;
      const client = new SecretManagerServiceClient(this.opts);
      return client;
    } catch (error) {
      throw new Error(
        "Package Google Cloud Secret Manager not found. Please install @google-cloud/secret-manager"
      );
    }
  }

  private convertTextToObject(text: string): Record<string, unknown> {
    const secretValues = text.split("\n");
    const secret = secretValues.reduce(
      (acc: Record<string, unknown>, cur: string) => {
        const [key, value] = cur.split("=");
        acc[key] = value;
        return acc;
      },
      {}
    );

    return secret;
  }

  async getSecret(): Promise<Record<string, unknown>> {
    const client = this.getClient();

    const [versionResponse] = await client.accessSecretVersion({
      name: `projects/${this.config.projectId}/secrets/${this.config.secretId}/versions/${this.config.version}`,
    });

    const secretValue = versionResponse.payload?.data?.toString();
    return this.convertTextToObject(secretValue);
  }
}
