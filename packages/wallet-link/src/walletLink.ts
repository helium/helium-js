/* eslint-disable object-curly-newline */
import Address from '@helium/address'
import { utils } from '@helium/crypto'
import queryString from 'query-string'
import { SignableKeypair } from '@helium/transactions'
import { getUnixTime } from 'date-fns'
import {
  DELEGATE_APPS,
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
  universalLink?: string
  path?: string
}) => {
  const { universalLink, path, ...params } = opts
  const query = queryString.stringify(params)

  return `${universalLink || 'https://wallet.helium.com/'}${path || 'link_wallet'}?${query}`
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
  if (!(opts.platform === 'android' || opts.platform === 'ios')) {
    throw new Error(`Platform '${opts.platform}' is not supported`)
  }

  const { signingAppId } = parseWalletLinkToken(opts.token) || {
    signingAppId: '',
  }
  const requestApp = DELEGATE_APPS.find(({ androidPackage, iosBundleId }) => {
    const id = opts.platform === 'android' ? androidPackage : iosBundleId
    return id === signingAppId
  })
  const universalLink = requestApp?.universalLink
  if (!universalLink) throw new Error('Could not find delegate app')

  const query = queryString.stringify(opts)
  return `${universalLink}sign_hotspot?${query}`
}
