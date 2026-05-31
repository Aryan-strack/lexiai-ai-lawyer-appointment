import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Payments API base route. Use specific endpoints like /create-payment-intent.' })
}