import type { Metadata } from "next"
import { Pencil } from "lucide-react"
import { requireStaff } from "@/lib/auth"
import { getTestimonials } from "@/lib/data/testimonials"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TestimonialDialog } from "@/components/testimonials/testimonial-dialog"
import { TestimonialDeleteButton } from "@/components/testimonials/testimonial-delete-button"
import { TestimonialActiveToggle } from "@/components/testimonials/testimonial-active-toggle"

export const metadata: Metadata = { title: "Testimonials" }

export default async function TestimonialsPage() {
  await requireStaff()
  const testimonials = await getTestimonials()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Testimonials</h1>
          <p className="text-sm text-muted-foreground">
            Storefront-wide reviews shown on the homepage and as a fallback on product pages with no reviews yet.
          </p>
        </div>
        <TestimonialDialog trigger={<Button type="button">New Testimonial</Button>} />
      </div>

      {testimonials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No testimonials yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Testimonial</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell className="font-medium">{testimonial.customer_name}</TableCell>
                <TableCell>{testimonial.rating} / 5</TableCell>
                <TableCell className="max-w-90 truncate">{testimonial.body}</TableCell>
                <TableCell>
                  <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                    {testimonial.is_active ? "Visible" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <TestimonialActiveToggle id={testimonial.id} isActive={testimonial.is_active} />
                    <TestimonialDialog
                      testimonial={testimonial}
                      tooltipLabel="Edit"
                      trigger={
                        <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit">
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TestimonialDeleteButton id={testimonial.id} customerName={testimonial.customer_name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
