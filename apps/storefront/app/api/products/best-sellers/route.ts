import "server-only"
import { NextResponse } from "next/server"
import { getBestSellers } from "@/lib/data/products"

export async function GET() {
  const products = await getBestSellers()
  return NextResponse.json({ products })
}
