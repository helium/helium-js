/* eslint-disable import/prefer-default-export */

export const toSnakeCase = (str?: string): string | undefined => {
  if (!str) return undefined

  return (str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [])
    .map((x) => x.toLowerCase())
    .join('_')
}
