"use client"

import { ProductSearchAutocomplete } from "./product-search-autocomplete"

// Nothing to close on desktop — unlike the mobile drawer, this doesn't
// live inside any chrome that navigating away should dismiss first.
function noop() {}

export function SearchBar() {
  return (
    <div className="hidden md:block w-56">
      <ProductSearchAutocomplete onNavigate={noop} />
    </div>
  )
}
