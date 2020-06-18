import nock from 'nock'
import { Keypair, Address } from '@helium/crypto'
import { Client } from '@helium/http'
import { PaymentV1, PaymentV2 } from '@helium/transactions'
import { bobWords, aliceB58 } from '../fixtures/users'

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
    'Qo4BCiEBNRpxwi/v7CIxk2rSgmshfs452fd/xsSWOZJimcOGkpUSIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBgKIAAoATJAktHevkssRliKmT7VAKJO5C2PX9Tf6J7nINHHCGz8gJmltkVLZybHjwFD2CEgbCET8nA+quH9hIzPrDsvNjBxDg==',
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
    'wgGQAQohATUaccIv7+wiMZNq0oJrIX7OOdn3f8bEljmSYpnDhpKVEiUKIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBAKGAAgASpArddm9xQjbzsT2FJ6POWYpdLgqlvjgb0YCeuw57FCoTBFfBE64hNyl8do7Tw0fa9IZdoydooXvGbg+CoP5ZIBBw=='
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
