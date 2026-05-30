// Generate URL-friendly slug from string
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

// Generate unique ID with prefix
export function generateUniqueId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${randomStr}`
}

// Generate random booking reference
export function generateBookingReference(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  
  let result = ''
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  result += '-'
  for (let i = 0; i < 4; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  return result
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

// Create SEO-friendly URL
export function createSeoUrl(title: string, id: string): string {
  const slug = generateSlug(title)
  return `/lawyers/${slug}-${id}`
}

// Extract ID from SEO URL
export function extractIdFromSeoUrl(url: string): string | null {
  const match = url.match(/-([a-f0-9-]+)$/)
  return match ? match[1] : null
}