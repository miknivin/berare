import Link from "next/link"
import Image from "next/image"
import { Truck, RotateCcw, ShieldCheck } from "lucide-react"
import { getCategories } from "@/lib/data/categories"
import { getProducts } from "@/lib/data/products"
import { ProductFilters } from "@/lib/data/product-filters"
import { getHeroBanners } from "@/lib/data/hero-banners"
import { getS3Url } from "@/lib/image"
import { ProductCarousel } from "@/components/product/product-carousel"
import { HeroSwiper } from "@/components/home/hero-swiper"

export default async function Home() {
  const [categories, { products }, banners] = await Promise.all([
    getCategories(),
    getProducts(new ProductFilters({ sort: "newest" })),
    getHeroBanners(),
  ])
  const topLevelCategories = categories.filter((c) => !c.parent_id)

  return (
    <div className="flex-1">
      {banners.length > 0 ? (
        <HeroSwiper banners={banners} />
      ) : (
        // Fallback while no banners have been uploaded yet in Admin.
        <section className="bg-muted">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-24 md:py-32 text-center">
            <h1 className="font-heading font-extrabold text-4xl md:text-6xl leading-tight tracking-tight">
              Cosmetics that
              <br />
              keep it simple
            </h1>
            <p className="mt-5 text-muted-foreground max-w-md mx-auto">
              Skincare, makeup, haircare, and fragrance — thoughtfully made, delivered across India.
            </p>
            <Link
              href="/products"
              className="mt-9 inline-flex items-center justify-center min-h-11 rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <Truck className="w-6 h-6 text-primary" aria-hidden="true" />
          <p className="text-xs md:text-sm text-muted-foreground">Delivery across India</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />
          <p className="text-xs md:text-sm text-muted-foreground">Secure checkout</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <RotateCcw className="w-6 h-6 text-primary" aria-hidden="true" />
          <p className="text-xs md:text-sm text-muted-foreground">Easy returns</p>
        </div>
      </section>

      {topLevelCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-6 py-14">
          <h2 className="font-heading font-bold text-2xl mb-7">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {topLevelCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative flex items-center justify-center aspect-4/3 rounded-xl overflow-hidden bg-muted hover:bg-secondary/40 transition-colors shadow-sm"
              >
                {category.image_path && (
                  <>
                    <Image
                      src={getS3Url(category.image_path)}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
                  </>
                )}
                <span
                  className={`relative font-heading font-semibold text-lg transition-colors ${
                    category.image_path
                      ? "text-white"
                      : "group-hover:text-primary"
                  }`}
                >
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-14 pb-24">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-heading font-bold text-2xl">New Arrivals</h2>
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            View All
          </Link>
        </div>
        <ProductCarousel products={products} />
      </section>
    </div>
  )
}
