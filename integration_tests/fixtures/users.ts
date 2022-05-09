import { Keypair } from '@helium/crypto'

/*  NOTE!
 *  These words generate real Helium accounts and should
 *  be considered COMPROMISED. Don't send any money to them that
 *  you don't want to lose.
 */

export const bobWords = [
  'indicate',
  'flee',
  'grace',
  'spirit',
  'trim',
  'safe',
  'access',
  'oppose',
  'void',
  'police',
  'calm',
  'energy',
]

export const aliceWords = [
  'trash',
  'speed',
  'marriage',
  'dress',
  'match',
  'nerve',
  'govern',
  'fence',
  'celery',
  'fiction',
  'myth',
  'gym',
]

export const bobB58 = '13M8dUbxymE3xtiAXszRkGMmezMhBS8Li7wEsMojLdb4Sdxc4wc'
export const aliceB58 = '148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3'
export const bobAliceMultisig2of2B58 = '1SYJnDnV2G1HSzoBF9nwd5apBX3pS7nLeLkjnVXemBZTP8C8F44TBYnr'
export const bobAliceMultisig1of2B58 = '1SVRdbavwiw4SM6cQFq6DN2nhK4YSqTd7cPhELjshVxzdQvoKbhQWocF'
export const testnetBobAliceMultisig2of2B58 = '14x4TpdfsLeL9MMcaJp6EVXFnA5tsgqXCr2u8MCL4qMEpKEYPCHZEEGJo'

export const bobBip39Words = bobWords.map((word) => (word !== 'energy' ? word : 'episode'))

export const usersFixture = async (): Promise<{bob: Keypair, alice: Keypair}> => ({
  bob: await Keypair.fromWords(bobWords),
  alice: await Keypair.fromWords(aliceWords),
})
