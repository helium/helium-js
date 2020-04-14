import axios from '@helium/http/node_modules/axios'
import { Keypair, Address } from '@helium/crypto'
import { Client } from '@helium/http'
import { PaymentV1, PaymentV2 } from '@helium/transactions'
import { bobWords, aliceB58 } from '../fixtures/users'

jest.mock('@helium/http/node_modules/axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

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

  const client = new Client()
  client.transactions.submit(serializedTxn)

  expect(
    mockedAxios.post,
  ).toHaveBeenCalledWith('https://api.helium.io/v1/pending_transactions', {
    txn: serializedTxn,
  })
})

test('create and submit a PaymentV2 txn', async () => {
  const entropy =
    '1f5b981baca0420259ab53996df7a8ce0e3549c6616854e7dff796304bafb6bf'
  const bob = await Keypair.fromEntropy(Buffer.from(entropy, 'hex'))
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
    'QmcKIQHZaiNDxWGBKpINPNipCSY7stqmxRzsr/YUl3+K8OQ5NigBMkDbyKhTERhqfVcF6P5TOhoLMeC/r3VsugJlWv6vViw+NujHdMzIGGRZNcpOJToocZhCrN7xoc4I+xqH78ce25sH',
  )

  const client = new Client()
  client.transactions.submit(serializedTxn)

  expect(
    mockedAxios.post,
  ).toHaveBeenCalledWith('https://api.helium.io/v1/pending_transactions', {
    txn: serializedTxn,
  })
})
