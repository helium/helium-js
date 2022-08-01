import nock from 'nock'
import { Keypair, MultisigSignature } from '@helium/crypto'
import Address, { MultisigAddress } from '@helium/address'
import { Client } from '@helium/http'
import { PaymentV1, PaymentV2 } from '@helium/transactions'
import KeySignature from '@helium/crypto/build/KeySignature'
import { bobWords, bobBip39Words, aliceB58 } from '../fixtures/users'

test('create and submit a payment txn', async () => {
  const bob = await Keypair.fromWords(bobWords)
  const aliceAddress = Address.fromB58(aliceB58)

  const paymentTxn = new PaymentV1({
    payer: bob.address,
    payee: aliceAddress,
    amount: 10,
    nonce: 1,
  })

  const signedPaymentTxn = await paymentTxn.sign({ payer: bob })
  const serializedTxn = signedPaymentTxn.toString()
  expect(serializedTxn).toBe(
    'QowBCiEBNRpxwi/v7CIxk2rSgmshfs452fd/xsSWOZJimcOGkpUSIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBgKKAEyQMsS6J6SCN1nTYjYPfVmkZUuttx85MSKjzO1b46+tibRZ2a0j+M7nSL8+rz/1PWq1yJQ24srzuZ34jTOrT5rswc=',
  )

  nock('https://api.helium.io')
    .post('/v1/pending_transactions', { txn: serializedTxn })
    .reply(200, {
      data: {
        hash: 'txn hash',
      },
    })

  const client = new Client()
  const pendingTxn = await client.transactions.submit(serializedTxn)

  expect(pendingTxn.hash).toBe('txn hash')
})

test('create and submit a PaymentV2 txn without token type', async () => {
  // const entropy =
  //   '1f5b981baca0420259ab53996df7a8ce0e3549c6616854e7dff796304bafb6bf'
  // const bob = await Keypair.fromEntropy(Buffer.from(entropy, 'hex'))
  const bob = await Keypair.fromWords(bobWords)
  const aliceAddress = Address.fromB58(aliceB58)

  const paymentTxn = new PaymentV2({
    payer: bob.address,
    payments: [
      {
        payee: aliceAddress,
        amount: 10,
      },
    ],
    nonce: 1,
  })

  const signedPaymentTxn = await paymentTxn.sign({ payer: bob })
  const serializedTxn = signedPaymentTxn.toString()
  expect(serializedTxn).toBe(
    'wgGOAQohATUaccIv7+wiMZNq0oJrIX7OOdn3f8bEljmSYpnDhpKVEiUKIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBAKIAEqQK88GjmG9CrESHVdcL//ZfWD+KsBnbKmZqKlx8oD89FUms7OjZNcL5NiQ4o0jREg+ahkjc2jX4SgKBBniM+QoAA=',
  )

  nock('https://api.helium.io')
    .post('/v1/pending_transactions', { txn: serializedTxn })
    .reply(200, {
      data: {
        hash: 'txn hash',
      },
    })

  const client = new Client()
  const pendingTxn = await client.transactions.submit(serializedTxn)

  expect(pendingTxn.hash).toBe('txn hash')
})

test('create and submit a PaymentV2 txn with token type hnt', async () => {
  // const entropy =
  //   '1f5b981baca0420259ab53996df7a8ce0e3549c6616854e7dff796304bafb6bf'
  // const bob = await Keypair.fromEntropy(Buffer.from(entropy, 'hex'))
  const bob = await Keypair.fromWords(bobWords)
  const aliceAddress = Address.fromB58(aliceB58)

  const paymentTxn = new PaymentV2({
    payer: bob.address,
    payments: [
      {
        payee: aliceAddress,
        amount: 10,
        tokenType: 'hnt',
      },
    ],
    nonce: 1,
  })

  const signedPaymentTxn = await paymentTxn.sign({ payer: bob })
  const serializedTxn = signedPaymentTxn.toString()
  expect(serializedTxn).toBe(
    'wgGOAQohATUaccIv7+wiMZNq0oJrIX7OOdn3f8bEljmSYpnDhpKVEiUKIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBAKIAEqQK88GjmG9CrESHVdcL//ZfWD+KsBnbKmZqKlx8oD89FUms7OjZNcL5NiQ4o0jREg+ahkjc2jX4SgKBBniM+QoAA=',
  )

  nock('https://api.helium.io')
    .post('/v1/pending_transactions', { txn: serializedTxn })
    .reply(200, {
      data: {
        hash: 'txn hash',
      },
    })

  const client = new Client()
  const pendingTxn = await client.transactions.submit(serializedTxn)

  expect(pendingTxn.hash).toBe('txn hash')
})

test('create and submit a PaymentV2 txn with token type mobile', async () => {
  const bob = await Keypair.fromWords(bobWords)
  const aliceAddress = Address.fromB58(aliceB58)

  const paymentTxn = new PaymentV2({
    payer: bob.address,
    payments: [
      {
        payee: aliceAddress,
        amount: 10,
        tokenType: 'mobile',
      },
    ],
    nonce: 1,
  })

  const signedPaymentTxn = await paymentTxn.sign({ payer: bob })
  const serializedTxn = signedPaymentTxn.toString()
  expect(serializedTxn).toBe(
    'wgGQAQohATUaccIv7+wiMZNq0oJrIX7OOdn3f8bEljmSYpnDhpKVEicKIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBAKKAIgASpAnWAECRCraixISn05hfmO0e9MrUD5BKP29XJFKbag+HnKUustLYagwfuDOtKiu9W0JzgeQX5rqp3Tq+uvvOMCDA==',
  )

  nock('https://api.helium.io')
    .post('/v1/pending_transactions', { txn: serializedTxn })
    .reply(200, {
      data: {
        hash: 'txn hash',
      },
    })

  const client = new Client()
  const pendingTxn = await client.transactions.submit(serializedTxn)

  expect(pendingTxn.hash).toBe('txn hash')
})

test('using the bip39 checksum word should match serialization', async () => {
  const bob = await Keypair.fromWords(bobBip39Words)
  const aliceAddress = Address.fromB58(aliceB58)

  const paymentTxn = new PaymentV2({
    payer: bob.address,
    payments: [
      {
        payee: aliceAddress,
        amount: 10,
      },
    ],
    nonce: 1,
  })

  const signedPaymentTxn = await paymentTxn.sign({ payer: bob })
  const serializedTxn = signedPaymentTxn.toString()

  expect(serializedTxn).toBe(
    'wgGOAQohATUaccIv7+wiMZNq0oJrIX7OOdn3f8bEljmSYpnDhpKVEiUKIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBAKIAEqQK88GjmG9CrESHVdcL//ZfWD+KsBnbKmZqKlx8oD89FUms7OjZNcL5NiQ4o0jREg+ahkjc2jX4SgKBBniM+QoAA=',
  )
})

test('create and sign multisig payment', async () => {
  const bob = await Keypair.fromWords(bobBip39Words)
  const aliceAddress = Address.fromB58(aliceB58)

  const multisigAddress = await MultisigAddress.create([bob.address, aliceAddress], 1)

  const paymentTxn = new PaymentV2({
    payer: multisigAddress,
    payments: [
      {
        payee: aliceAddress,
        amount: 10,
      },
    ],
    nonce: 1,
  })
  // Sign with bob keypair and create signature for multisig
  const bobSignedTransaction = await paymentTxn.sign({ payer: bob })
  const bobSignature: Uint8Array = bobSignedTransaction.signature || new Uint8Array()

  // Create map of address to signature and convert to KeySignature list
  const signatureMap = new Map([[bob.address, bobSignature]])
  const signatures = KeySignature.fromMap([bob.address, aliceAddress], signatureMap)

  // Construct multisig signature and verify
  const multisigSig = new MultisigSignature([bob.address, aliceAddress], signatures)
  expect(multisigSig.isValid(multisigAddress)).toBeTruthy()

  // Sign payment trasnaction with multisig signature
  await paymentTxn.sign({ payer: multisigSig })

  const serializedTxn = paymentTxn.toString()
  expect(serializedTxn).toBe(
    'wgHXAQolAgECEiBqqzKbCO7og1KrG7VnpqrgT+wIowchqqdNAdWDQAa5HRIlCiEBnGWdcjzB6BCnLnj33q9HNqh/EO+Pz8gBALUzJ+fuSaQQCiABKoQBATUaccIv7+wiMZNq0oJrIX7OOdn3f8bEljmSYpnDhpKVAZxlnXI8wegQpy54996vRzaofxDvj8/IAQC1Myfn7kmkAEDfDD6a0GpxsreMPBmr+VACsNHtdEpBnCL1RUzTvqS6N7x9dmSEt8SZeqlTFTmzaLoC8zi4OCNf6zcf+Z347fsH',
  )
})
