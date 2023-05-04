/* eslint-disable object-curly-newline */
import Address from '@helium/address'
import { utils } from '@helium/crypto'
import queryString from 'query-string'
import { SignableKeypair } from '@helium/transactions'
import { getUnixTime } from 'date-fns'
import {
  HELIUM_WALLET_APP,
  LinkWalletResponse,
  SignHotspotRequest,
  SignHotspotResponse,
  Token,
  TokenWithSig,
} from './types'

// JSON.stringify is unpredictable, this is the original ordering we had
const stringifyToken = (token: Token) =>
  // eslint-disable-next-line no-useless-escape, implicit-arrow-linebreak
  `{\"time\":${token.time},\"address\":\"${token.address}\",\"requestAppId\":\"${token.requestAppId}\",\"signingAppId\":\"${token.signingAppId}\",\"callbackUrl\":\"${token.callbackUrl}\",\"appName\":\"${token.appName}\"}`

export const makeAppLinkAuthToken = async (tokenOpts: Token, keypair: SignableKeypair) => {
  const message = stringifyToken(tokenOpts)
  const signatureResult = await keypair.sign(message)
  const signature = Buffer.from(signatureResult).toString('base64')

  const signedToken = {
    ...tokenOpts,
    signature,
  }
  return Buffer.from(JSON.stringify(signedToken)).toString('base64')
}

export const verifyWalletLinkToken = (
  linkToken: TokenWithSig,
  opts?: { maxAgeInSeconds: number },
) => {
  const { signature, ...token } = linkToken

  if (opts?.maxAgeInSeconds) {
    const expiration = getUnixTime(new Date()) - opts.maxAgeInSeconds
    if (linkToken.time < expiration) throw new Error('Token is expired')
  }

  const message = stringifyToken(token)
  const { publicKey } = Address.fromB58(token.address)
  return utils.verify(
    Uint8Array.from(Buffer.from(signature, 'base64')),
    Uint8Array.from(Buffer.from(message)),
    publicKey,
  )
}

export const parseWalletLinkToken = (base64Token: string) => {
  const buff = Buffer.from(base64Token, 'base64')
  const container = buff.toString('utf-8')
  return JSON.parse(container) as TokenWithSig
}

export const createWalletLinkUrl = (opts: {
  requestAppId: string
  callbackUrl: string
  appName: string
  path?: string
}) => {
  const { path, ...params } = opts
  const query = queryString.stringify(params)

  return `${HELIUM_WALLET_APP.universalLink}${path || 'link_wallet'}?${query}`
}

export const createLinkWalletCallbackUrl = (
  protocol: string,
  address: string,
  responseParams: LinkWalletResponse,
) => `${protocol}link_wallet/${address}?${queryString.stringify(responseParams)}`

export const createSignHotspotCallbackUrl = (
  protocol: string,
  responseParams: SignHotspotResponse,
) => `${protocol}sign_hotspot?${queryString.stringify(responseParams)}`

export const createUpdateHotspotUrl = (opts: SignHotspotRequest) => {
  const query = queryString.stringify(opts)
  return `${HELIUM_WALLET_APP.universalLink}sign_hotspot?${query}`
}
