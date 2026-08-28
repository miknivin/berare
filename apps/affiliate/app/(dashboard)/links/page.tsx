import type { Metadata } from "next"
import { requireActiveAffiliate } from "@/lib/auth"
import { getMyLinks, getActiveProducts } from "@/lib/data/affiliate"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GenerateLinkForm } from "@/components/links/generate-link-form"
import { CopyLinkButton } from "@/components/links/copy-link-button"

export const metadata: Metadata = { title: "Links" }

export default async function LinksPage() {
  const { affiliate } = await requireActiveAffiliate()
  const [links, products] = await Promise.all([getMyLinks(affiliate.id), getActiveProducts()])

  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? ""

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Links</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your referral code: <span className="font-mono font-medium">{affiliate.referral_code}</span>
      </p>

      <div className="rounded-xl border border-border p-4 mb-8">
        <GenerateLinkForm products={products} />
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">No links yet — generate one above.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Link</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const url = link.products
                ? `${storefrontUrl}/products/${link.products.slug}?ref=${link.code}`
                : `${storefrontUrl}/?ref=${link.code}`
              return (
                <TableRow key={link.id}>
                  <TableCell className="font-mono text-xs max-w-70 truncate">{url}</TableCell>
                  <TableCell>{link.products?.name ?? <Badge variant="secondary">General</Badge>}</TableCell>
                  <TableCell>{link.clicks_count}</TableCell>
                  <TableCell>{link.orders_count}</TableCell>
                  <TableCell className="text-right">
                    <CopyLinkButton url={url} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
