# @objectwow/cloud-secret

A secure and efficient solution for managing sensitive data by dynamically loading secrets from cloud providers, eliminating the need for storing them in .env files.

⭐️ Your star shines on us. Star us on [GitHub](https://github.com/objectwow/cloud-secret)!

# Problem

Many teams choose to store sensitive data in .env files and push them to private repositories. While this approach makes it easier to share environment variables and manage changes across the team, it poses a significant security risk. Sensitive information can still be accidentally exposed due to human error, even when stored in a private repository.

# Solution

The proposed solution is to split the environment variables into two parts: insensitive data stored in the source code, such as configuration details, and sensitive data stored in the cloud, including information like access keys and database passwords.

# Installation

```
npm i @objectwow/cloud-secret
```

# Usage

## With Google Secret Manager

### Step 1: Setup authentication

There are two ways to authentication with GCP

#### Solution 1: Setup gcloud CLI

- Recommendation, because when someone leaves, you can delete their account to prevent further access.
- Link: https://cloud.google.com/sdk/docs/install
- After that, login: `gcloud auth application-default login`

#### Solution 2: Setup authentication by service account or keyFilename

- Link: https://cloud.google.com/iam/docs/service-accounts-create#console

### Step 2: Setup source code via sample

See sample at [here](./example/google)

## With AWS Secret Manager

Coming soon...

## With Azure Key Vault

Coming soon...

## With Hashicorp Vault

Coming soon...

# Parameters

### Provider

- GoogleProvider
- AWSProvider
- AzureProvider
- VaultProvider

### Config

- enable: Whether to enable the secret manager. On the server, if you inject all sensitive data via Deployment or Shell, you don’t need to use it, so you MUST set this to false. Default is true.
- useCache: A boolean indicating whether to use file cache or not. Default is true.
- envPath: Path to store environment variables in a file. This is helpful when using a Monorepo.
- hashKey: A string indicating the hash key to encrypt and decrypt secret values. Leave it blank if you don't want to encrypt secret values.
- debug: A boolean indicating whether to print debug message or not. Default is true.

# Internal resources

# Contact

If you have any questions, feel free to open an [`open an issue on GitHub`](https://github.com/objectwow/cloud-secret/issues) or connect with me on [`Linkedin`](https://www.linkedin.com/in/vtuanjs/).

Thank you for using and supporting the project!
