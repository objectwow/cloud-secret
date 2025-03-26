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

## With AWS Secret Manager

## With Azure Key Vault

## With Hashicorp Vault

# Parameters

```typescript

```

# Internal resources

# Contact

If you have any questions, feel free to open an [`open an issue on GitHub`](https://github.com/objectwow/cloud-secret/issues) or connect with me on [`Linkedin`](https://www.linkedin.com/in/vtuanjs/).

Thank you for using and supporting the project!
