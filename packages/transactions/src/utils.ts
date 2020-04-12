/* eslint-disable import/prefer-default-export */
export const toUint8Array = (
  str: string | Uint8Array | undefined | null,
): Uint8Array => Uint8Array.from(Buffer.from(str || ''))
