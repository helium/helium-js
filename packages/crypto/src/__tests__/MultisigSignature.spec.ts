import { MultisigAddress } from '@helium/address'
import { MultisigSignature } from '..'
import { usersFixture } from '../../../../integration_tests/fixtures/users'

describe('create', () => {
  it('invalid if not enough signatures', async () => {
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    expect(async () => {
      MultisigSignature.create(multisigAddress, [bob.address, alice.address], new Map())
    }).rejects.toThrow()
  })

  it('invalid if not enough addresses', async () => {
    const { bob, alice } = await usersFixture()
    const signatures = new Map([[bob.address, await bob.sign('Hello')]])
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    expect(async () => {
      MultisigSignature.create(multisigAddress, [alice.address], signatures)
    }).rejects.toThrow()
  })

  it('invalid if too many (unique) addresses', async () => {
    const { bob, alice } = await usersFixture()
    const signatures = new Map([[bob.address, await bob.sign('Hello')]])
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    expect(async () => {
      MultisigSignature.create(
        multisigAddress, [bob.address, bob.address, alice.address], signatures,
      )
    }).rejects.toThrow()
  })

  it('create a multisig signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)

    const signatures = new Map([[bob.address, await bob.sign(message)]])
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(multisigSig.signatures.length).toBe(1)
    expect(multisigSig.signatures[0].index).toBe(0)
    expect(multisigSig.addresses.length).toBe(2)
    expect(multisigSig.addresses[0].b58).toBe(bob.address.b58)
    expect(multisigSig.addresses[1].b58).toBe(alice.address.b58)
  })
})

describe('verify', () => {
  it('verify one of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = new Map([[bob.address, await bob.sign(message)]])
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(multisigSig.verify(message)).toBe(1)
  })

  it('verify fail one of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = new Map([[bob.address, await bob.sign(Buffer.from('Oops'))]])
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(multisigSig.verify(message)).toBe(0)
  })

  it('verify two of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 2)
    const signatures = new Map(
      [[bob.address, await bob.sign(message)], [alice.address, await alice.sign(message)]],
    )
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(multisigSig.verify(message)).toBe(2)
  })

  it('verify fail two of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 2)
    const signatures = new Map(
      [[bob.address, await bob.sign(message)], [alice.address, await alice.sign(Buffer.from('Oops'))]],
    )
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(multisigSig.verify(message)).toBe(1)
  })
})

describe('bin', () => {
  it('serialize appropriately', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = new Map([[bob.address, await bob.sign(message)]])
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(multisigSig.bin[0]).toBe(1)
  })

  it('serialize with signatures in correct sorted order', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)

    const signatures2 = new Map(
      [[alice.address, await alice.sign(message)], [bob.address, await bob.sign(message)]],
    )
    const multisigSig2 = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures2,
    )

    // Signatures not sorted
    expect(multisigSig2.signatures[1].index).toBe(0)
    expect(multisigSig2.signatures[0].index).toBe(1)

    const multisigSignatureTest2 = MultisigSignature.fromBin(multisigAddress, multisigSig2.bin)
    expect(multisigSignatureTest2.verify(message)).toBe(2)
    expect(multisigSignatureTest2.signatures[1].signature).toStrictEqual(await alice.sign(message))

    // Signatures sorted
    expect(multisigSignatureTest2.signatures[0].index).toBe(0)
    expect(multisigSignatureTest2.signatures[1].index).toBe(1)
  })
})

describe('fromBin', () => {
  it('deserialize appropriately', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = new Map([[bob.address, await bob.sign(message)]])
    const multisigSig = MultisigSignature.create(
      mltisigAddress, [bob.address, alice.address], signatures,
    )
    const multisigSignatureFromBin = MultisigSignature.fromBin(multisigAddress, multisigSig.bin)
    expect(multisigSignatureFromBin.verify(message)).toBe(1)
    expect(multisigSignatureFromBin.signatures[0].signature).toStrictEqual(await bob.sign(message))
  })
})

describe('isValid', () => {
  it('is valid if can deserialize', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = new Map([[bob.address, await bob.sign(message)]])
    const multisigSig = MultisigSignature.create(
      multisigAddress, [bob.address, alice.address], signatures,
    )
    expect(MultisigSignature.isValid(multisigAddress, multisigSig.bin)).toBe(true)
  })

  it('is not valid if cannot deserialize', async () => {
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    expect(MultisigSignature.isValid(
      multisigAddress, new Uint8Array(Buffer.from('notavalidmultisigserialization')),
    )).toBe(false)
  })
})
