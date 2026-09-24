// Shared caps for the product form's chip-list fields (everything except
// key features, which keeps its own limits in lib/key-features.ts). Used
// by both ChipListInput (client-side UX) and the server action's zod
// schema, so the two never drift out of sync.
export const CHIP_LIST_LIMITS = {
  benefits: { maxItems: 8, maxWordsPerItem: 6 },
  skinTypes: { maxItems: 8, maxWordsPerItem: 6 },
  keyIngredients: { maxItems: 12, maxWordsPerItem: 8 },
} as const
