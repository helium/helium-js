export const MixedCurrencyTypeError = new Error(
  'Arguments provided to arithmetic functions must be of the same currency type.',
)

export const OraclePriceRequiredError = new Error(
  'This conversion requires an oracle price to compute.',
)
