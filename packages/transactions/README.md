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
