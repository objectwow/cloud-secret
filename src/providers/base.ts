export abstract class BaseProvider {
  abstract getSecret(keys: string[]): Promise<Record<string, unknown>>;
}
