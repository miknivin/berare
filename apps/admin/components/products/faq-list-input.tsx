"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export type ProductFaqDraft = { question: string; answer: string }

const MAX_FAQS = 15

export function FaqListInput({
  value,
  onChange,
}: {
  value: ProductFaqDraft[]
  onChange: (faqs: ProductFaqDraft[]) => void
}) {
  function addFaq() {
    if (value.length >= MAX_FAQS) return
    onChange([...value, { question: "", answer: "" }])
  }

  function updateFaq(index: number, field: "question" | "answer", text: string) {
    onChange(value.map((faq, i) => (i === index ? { ...faq, [field]: text } : faq)))
  }

  function removeFaq(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {value.map((faq, index) => (
        <div key={index} className="rounded-lg border border-border p-3 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`faq-question-${index}`}>Question {index + 1}</Label>
              <Input
                id={`faq-question-${index}`}
                value={faq.question}
                onChange={(e) => updateFaq(index, "question", e.target.value)}
                placeholder="e.g. Is this suitable for sensitive skin?"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFaq(index)}
              aria-label={`Remove question ${index + 1}`}
              className="mt-6 shrink-0"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
            <Textarea
              id={`faq-answer-${index}`}
              value={faq.answer}
              onChange={(e) => updateFaq(index, "answer", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addFaq} disabled={value.length >= MAX_FAQS}>
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add Question
      </Button>
      <p className="text-xs text-muted-foreground">
        {value.length}/{MAX_FAQS} questions
      </p>
    </div>
  )
}
