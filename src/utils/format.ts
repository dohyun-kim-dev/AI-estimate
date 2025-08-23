export const formatPrice = (price: number): string => {
  return price.toLocaleString()
}

export const parsePrice = (price: string): number => {
  return parseInt(price.replace(/,/g, ''), 10) || 0
}
