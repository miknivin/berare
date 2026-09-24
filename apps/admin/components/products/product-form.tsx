"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProduct, updateProduct } from "@/app/(dashboard)/products/actions"
import type { Category } from "@/lib/data/categories"
import type { ProductDetail } from "@/lib/data/products"
import { ChipListInput } from "./chip-list-input"
import { FaqListInput, type ProductFaqDraft } from "./faq-list-input"
import { MAX_KEY_FEATURES, MAX_WORDS_PER_KEY_FEATURE } from "@/lib/key-features"
import { CHIP_LIST_LIMITS } from "@/lib/chip-list-limits"

const STEPS = [
  { id: "basics", label: "1. Basics" },
  { id: "highlights", label: "2. Highlights" },
  { id: "info", label: "3. Product Info" },
  { id: "details", label: "4. Details" },
] as const
type StepId = (typeof STEPS)[number]["id"]

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[]
  product?: ProductDetail
}) {
  const router = useRouter()
  const [step, setStep] = useState<StepId>("basics")

  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product ? String(product.price) : "")
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compare_at_price != null ? String(product.compare_at_price) : ""
  )
  const [status, setStatus] = useState<"draft" | "active" | "disabled">(product?.status ?? "draft")
  const [categoryId, setCategoryId] = useState<string | null>(product?.category_id ?? null)
  const [netVolume, setNetVolume] = useState(product?.net_volume ?? "")
  const [stockQuantity, setStockQuantity] = useState(product ? String(product.stock_quantity) : "0")

  const [keyFeatures, setKeyFeatures] = useState<string[]>(product?.key_features ?? [])
  const [benefits, setBenefits] = useState<string[]>(product?.benefits ?? [])
  const [skinTypes, setSkinTypes] = useState<string[]>(product?.skin_types ?? [])
  const [keyIngredients, setKeyIngredients] = useState<string[]>(product?.key_ingredients ?? [])

  const [whatItIs, setWhatItIs] = useState(product?.what_it_is ?? "")
  const [whatItDoes, setWhatItDoes] = useState(product?.what_it_does ?? "")
  const [howItWorks, setHowItWorks] = useState(product?.how_it_works ?? "")

  const [fullIngredients, setFullIngredients] = useState(product?.full_ingredients ?? "")
  const [directionsToUse, setDirectionsToUse] = useState(product?.directions_to_use ?? "")
  const [faqs, setFaqs] = useState<ProductFaqDraft[]>(product?.faqs ?? [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const input = {
      name,
      description: description || undefined,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      status,
      categoryId,
      netVolume: netVolume || undefined,
      stockQuantity: Number(stockQuantity),
      keyFeatures,
      benefits,
      skinTypes,
      keyIngredients,
      whatItIs: whatItIs || undefined,
      whatItDoes: whatItDoes || undefined,
      howItWorks: howItWorks || undefined,
      fullIngredients: fullIngredients || undefined,
      directionsToUse: directionsToUse || undefined,
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
    }

    const result = product ? await updateProduct(product.id, input) : await createProduct(input)

    if (!result.success) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    // New products land back on their own edit page so images can be
    // added right away — product_images needs a real product_id to
    // attach to, so upload isn't possible until after this first save.
    router.push(product ? "/products" : `/products/${result.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <Tabs value={step} onValueChange={(v) => v && setStep(v as StepId)}>
        <TabsList>
          {STEPS.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basics">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (INR)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="compareAtPrice">
                  Original price <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="Leave blank for no discount"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stockQuantity">Stock quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Decreases automatically as orders come in; the storefront blocks checkout once it hits 0.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="netVolume">
                Net volume <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="netVolume"
                value={netVolume}
                onChange={(e) => setNetVolume(e.target.value)}
                placeholder="e.g. 100ml, 50g"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => v && setStatus(v as typeof status)}
                items={[
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "disabled", label: "Disabled" },
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={categoryId ?? "none"}
                onValueChange={(v) => setCategoryId(!v || v === "none" ? null : v)}
                items={[
                  { value: "none", label: "No category" },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="highlights">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>
                Key features <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <ChipListInput
                value={keyFeatures}
                onChange={setKeyFeatures}
                placeholder="e.g. Paraben-free formula"
                maxItems={MAX_KEY_FEATURES}
                maxWordsPerItem={MAX_WORDS_PER_KEY_FEATURE}
              />
              <p className="text-xs text-muted-foreground">
                Short, eye-catching highlights shown above the description on the product page.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>
                Helps with <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <ChipListInput
                value={benefits}
                onChange={setBenefits}
                placeholder="e.g. Dark Spots Reduction"
                maxItems={CHIP_LIST_LIMITS.benefits.maxItems}
                maxWordsPerItem={CHIP_LIST_LIMITS.benefits.maxWordsPerItem}
              />
              <p className="text-xs text-muted-foreground">Shown as the &quot;Helps With&quot; checklist.</p>
            </div>

            <div className="space-y-1.5">
              <Label>
                Works best for <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <ChipListInput
                value={skinTypes}
                onChange={setSkinTypes}
                placeholder="e.g. Oily to Combination Skin"
                maxItems={CHIP_LIST_LIMITS.skinTypes.maxItems}
                maxWordsPerItem={CHIP_LIST_LIMITS.skinTypes.maxWordsPerItem}
              />
              <p className="text-xs text-muted-foreground">Shown as the &quot;Works Best For&quot; list.</p>
            </div>

            <div className="space-y-1.5">
              <Label>
                Key ingredients <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <ChipListInput
                value={keyIngredients}
                onChange={setKeyIngredients}
                placeholder="e.g. 5% Niacinamide"
                maxItems={CHIP_LIST_LIMITS.keyIngredients.maxItems}
                maxWordsPerItem={CHIP_LIST_LIMITS.keyIngredients.maxWordsPerItem}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info">
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Shown as three switchable tabs in the product page&apos;s Product Info section. Leave any of
              these blank to hide that tab.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="whatItIs">What it is?</Label>
              <Textarea id="whatItIs" value={whatItIs} onChange={(e) => setWhatItIs(e.target.value)} rows={4} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatItDoes">What it does?</Label>
              <Textarea
                id="whatItDoes"
                value={whatItDoes}
                onChange={(e) => setWhatItDoes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="howItWorks">How it does?</Label>
              <Textarea
                id="howItWorks"
                value={howItWorks}
                onChange={(e) => setHowItWorks(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullIngredients">
                Full ingredient list <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="fullIngredients"
                value={fullIngredients}
                onChange={(e) => setFullIngredients(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="directionsToUse">
                Directions to use <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="directionsToUse"
                value={directionsToUse}
                onChange={(e) => setDirectionsToUse(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                FAQs <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <FaqListInput value={faqs} onChange={setFaqs} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Cancel
        </Button>

        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep(STEPS[stepIndex - 1].id)}>
              Back
            </Button>
          )}
          {stepIndex < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(STEPS[stepIndex + 1].id)}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : product ? "Save Changes" : "Create Product"}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
