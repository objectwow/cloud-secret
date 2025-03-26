import { SecretManager, GoogleProvider } from "../../src";

async function loadEnvFile() {
  // You need to install devDependencies - @google-cloud/secret-manager
  // npm i -D @google-cloud/secret-manager
  const secretManager = new SecretManager(
    new GoogleProvider(
      {
        projectId: process.env.PROJECTID,
        secretId: process.env.SECRET_ID,
      },
      {
        // Another authentication method if you don't use gcloud auth
        // Check at document GoogleAuthOptions - https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#creating-the-client-instance
      }
    ),
    {
      hashKey: "your_device_info",
      useCache: true,
      // On the server, you can set environment variables directly using the shell,
      // so there is no need to enable this.
      // Set `enable` to `false` or an empty string ("") to disable it.
      enable: process.env.IS_ENABLE_CLOUD_SECRET ? true : false,
    }
  );

  await secretManager.loadENV(["REDIS_PASSWORD", "KAFKA_PASS"]);
}

async function main() {
  await loadEnvFile();

  console.log(process.env.REDIS_PASSWORD);
  console.log(process.env.KAFKA_PASS);

  // Your start application logic
}

main();
