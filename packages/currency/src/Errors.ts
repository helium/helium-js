export const MixedCurrencyTypeError = new Error(
  'Arguments provided to arithmetic functions must be of the same currency type.',
)

export const UnsupportedCurrencyConversionError = new Error(
  'This currency does not support this type of conversion',
)

export const OraclePriceRequiredError = new Error(
  'This conversion requires an oracle price to compute.',
)
