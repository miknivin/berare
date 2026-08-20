import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ShieldCheck, Truck } from "lucide-react"
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductGrid } from "@/components/product/product-grid"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { formatPrice } from "@/lib/format"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return { title: product?.name ?? "Product" }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category_id, product.id)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
        <Link href="/products" className="hover:text-foreground">
          All Products
        </Link>
        {product.categories && (
          <>
            {" / "}
            <Link href={`/categories/${product.categories.slug}`} className="hover:text-foreground">
              {product.categories.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <ProductGallery
          images={product.product_images}
          alt={product.name}
          className="aspect-square"
        />

        <div>
          <h1 className="font-heading text-2xl md:text-3xl">{product.name}</h1>
          <p className="mt-2 text-2xl font-medium">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
              Delivered across India
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              Secure checkout with Razorpay
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="font-heading text-2xl mb-6">You May Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
