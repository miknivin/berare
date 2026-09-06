import Link from "next/link"
import Image from "next/image"
import "./category-card.css"
import { getS3Url } from "@/lib/image"
import type { Category } from "@/lib/data/categories"

// A 3D tilt card (adapted from a Uiverse.io concept by Smit-Prajapati),
// deliberately inverted from the usual pattern: the tilted, layered-depth
// look is the RESTING state here, and it settles flat with a soft
// background blur on hover — the opposite of the original, where flat was
// the default and the tilt only appeared on hover.
export function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="category-card-parent">
      <Link href={`/categories/${category.slug}`} className="category-card block">
        {category.image_path ? (
          <Image
            src={getS3Url(category.image_path)}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="category-card__image object-cover"
          />
        ) : (
          <div className="category-card__image-fallback" />
        )}

        <div className="category-card__content">
          <span className="category-card__title">{category.name}</span>
          <span className="category-card__cta">Shop Now</span>
        </div>
      </Link>
    </div>
  )
}
