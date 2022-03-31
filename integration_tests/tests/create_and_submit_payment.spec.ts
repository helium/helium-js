import nock from 'nock'
import { Keypair } from '@helium/crypto'
import Address from '@helium/address'
import { Client } from '@helium/http'
import { PaymentV1, PaymentV2 } from '@helium/transactions'
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

test('create and submit a PaymentV2 txn', async () => {
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
