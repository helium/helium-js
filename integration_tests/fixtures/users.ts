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

export const usersFixture = async () => ({
  bob: await Keypair.fromWords(bobWords),
  alice: await Keypair.fromWords(aliceWords),
})
