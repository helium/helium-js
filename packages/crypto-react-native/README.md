# `@helium/crypto-react-native`

## Getting Started

```
yarn add @helium/crypto-react-native
```

`@helium/crypto-react-native` now uses the [@noble/curves](https://github.com/paulmillr/noble-curves) and [@noble/hashes](https://github.com/paulmillr/noble-hashes) libraries for cryptographic operations, providing a pure JavaScript implementation without requiring native dependencies.

This package provides the same API as `@helium/crypto` but is optimized for React Native environments.

## API

The package exports cryptographic utilities for:

- ED25519 key pair generation and management
- Digital signature creation and verification
- Secure random number generation
- SHA-256 hashing
- Mnemonic seed phrase handling

## Benefits

- **Pure JavaScript**: No native dependencies required
- **Audited**: Uses well-audited Noble cryptography libraries
- **Lightweight**: Tree-shakeable and optimized for mobile
- **Secure**: Implements industry-standard cryptographic algorithms
- **Compatible**: Same API as `@helium/crypto`
