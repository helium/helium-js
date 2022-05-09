import { MultisigAddress } from '@helium/address'
import { KeySignature, MultisigSignature } from '..'
import { usersFixture } from '../../../../integration_tests/fixtures/users'

describe('create', () => {
  it('invalid if not enough signatures', async () => {
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = KeySignature.fromMap([bob.address, alice.address], new Map())
    const multisigSignature = new MultisigSignature([bob.address, alice.address], signatures)
    expect(await multisigSignature.isValid(multisigAddress)).toBeFalsy()
  })

  it('invalid if not enough addresses', async () => {
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map([[bob.address, await bob.sign('Hello')]])
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSignature = new MultisigSignature([bob.address], signatures)
    expect(await multisigSignature.isValid(multisigAddress)).toBeFalsy()
  })

  it('invalid if too many (unique) addresses', async () => {
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map([[bob.address, await bob.sign('Hello')]])
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSignature = new MultisigSignature(
      [bob.address, bob.address, alice.address], signatures,
    )
    expect(await multisigSignature.isValid(multisigAddress)).toBeFalsy()
  })

  it('create a multisig signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)

    const signatureMap = new Map([[bob.address, await bob.sign(message)]])
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSignature = new MultisigSignature([bob.address, alice.address], signatures)

    expect(multisigSignature.isValid(multisigAddress)).toBeTruthy()
    expect(multisigSignature.signatures.length).toBe(1)
    expect(multisigSignature.signatures[0].index).toBe(0)
    expect(multisigSignature.addresses.length).toBe(2)
    expect(multisigSignature.addresses[0].b58).toBe(bob.address.b58)
    expect(multisigSignature.addresses[1].b58).toBe(alice.address.b58)
  })
})

describe('verify', () => {
  it('verify one of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map([[bob.address, await bob.sign(message)]])
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
    expect(await multisigSig.verify(message)).toBe(1)
  })

  it('verify fail one of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map([[bob.address, await bob.sign(Buffer.from('Oops'))]])
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
    expect(await multisigSig.verify(message)).toBe(0)
  })

  it('verify two of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map(
      [[bob.address, await bob.sign(message)], [alice.address, await alice.sign(message)]],
    )
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
    expect(await multisigSig.verify(message)).toBe(2)
  })

  it('verify fail two of two signature', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map(
      [[bob.address, await bob.sign(message)], [alice.address, await alice.sign(Buffer.from('Oops'))]],
    )
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
    expect(await multisigSig.verify(message)).toBe(1)
  })
})

describe('bin', () => {
  it('serialize appropriately', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const signatureMap = new Map([[bob.address, await bob.sign(message)]])
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
    expect(multisigSig.bin[0]).toBe(1)
  })

  it('serialize with signatures in correct sorted order', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)

    const signatureMap = new Map(
      [[alice.address, await alice.sign(message)], [bob.address, await bob.sign(message)]],
    )
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)

    // Signatures not sorted
    expect(multisigSig.signatures[1].index).toBe(0)
    expect(multisigSig.signatures[0].index).toBe(1)

    const multisigSignatureTest = MultisigSignature.fromBin(multisigAddress, multisigSig.bin)
    expect(await multisigSignatureTest.verify(message)).toBe(2)
    expect(multisigSignatureTest.signatures[1].signature).toStrictEqual(await alice.sign(message))

    // Signatures sorted
    expect(multisigSignatureTest.signatures[0].index).toBe(0)
    expect(multisigSignatureTest.signatures[1].index).toBe(1)
  })
})

describe('fromBin', () => {
  it('deserialize appropriately', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatureMap = new Map([[bob.address, await bob.sign(message)]])
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
    const multisigSignatureFromBin = MultisigSignature.fromBin(multisigAddress, multisigSig.bin)
    expect(await multisigSignatureFromBin.verify(message)).toBe(1)
    expect(multisigSignatureFromBin.signatures[0].signature).toStrictEqual(await bob.sign(message))
  })
})

describe('isValid', () => {
  it('is valid if can deserialize', async () => {
    const message = Buffer.from('Hello')
    const { bob, alice } = await usersFixture()
    const multisigAddress = await MultisigAddress.create([bob.address, alice.address], 1)
    const signatureMap = new Map([[bob.address, await bob.sign(message)]])
    const signatures = KeySignature.fromMap([bob.address, alice.address], signatureMap)
    const multisigSig = new MultisigSignature([bob.address, alice.address], signatures)
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
