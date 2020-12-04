# `@helium/transactions`

Construct and serialize transaction primatives from their protobuf definitions.

## Token Burn V1
```ts
// create transcation
 const transaction =  new TokenBurnV1({
    payer: payerAddress,
    payee: payeeAddress,
    amount: 10,
    nonce: 1,
    memo: 'MTIzNDU2Nzg5MA==',
})

// sign transaction
const signedTransaction = await transaction.sign({ payer: payerKeypair })
```

## Transfer Hotspot V1
```ts
// create transcation
 const transaction =  new TransferHotspotV1({
    gateway: gatewayAddress,
    buyer: buyerAddress,
    seller: sellerAddress,
    amountToSeller: 100,
    buyerNonce: 1,
})

// sign transaction as buyer
const signedTransaction = await transaction.sign({ buyer: buyerKeypair })

// sign transaction as seller
const signedTransaction = await transaction.sign({ seller: sellerKeypair })
```

## Deserialization

```ts
const paymentTxn = new PaymentV2({
  payer,
  payments,
  nonce,
})

const serializedPaymentV2 = paymentTxn.toString()

const deserializedPaymentV2 = PaymentV2.fromString(serializedPaymentV2)
```
