import axios from '@helium/http/node_modules/axios'
import { Keypair, Address } from '@helium/crypto'
import { Client } from '@helium/http'
import { Payment } from '@helium/transactions'
import { bobWords, aliceB58 } from '../fixtures/users'

jest.mock('@helium/http/node_modules/axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

test('create and submit a payment txn', async () => {
  const bob = await Keypair.fromWords(bobWords)
  const aliceAddress = Address.fromB58(aliceB58)

  const paymentTxn = new Payment({
    payer: bob.address,
    payee: aliceAddress,
    amount: 10,
    nonce: 1,
  })

  const signedPaymentTxn = await paymentTxn.sign({ payer: bob })
  const serializedTxn = signedPaymentTxn.toString()
  expect(serializedTxn).toBe('QowBCiEBNRpxwi/v7CIxk2rSgmshfs452fd/xsSWOZJimcOGkpUSIQGcZZ1yPMHoEKcuePfer0c2qH8Q74/PyAEAtTMn5+5JpBgKKAEyQMsS6J6SCN1nTYjYPfVmkZUuttx85MSKjzO1b46+tibRZ2a0j+M7nSL8+rz/1PWq1yJQ24srzuZ34jTOrT5rswc=')

  const client = new Client()
  client.transactions.submit(serializedTxn)

  expect(mockedAxios.post).toHaveBeenCalledWith(
    'https://api.helium.io/v1/pending_transactions',
    { txn: serializedTxn },
  )
})
