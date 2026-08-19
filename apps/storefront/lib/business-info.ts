export const BUSINESS_INFO = {
  legalName: "Be Rare Cosmetics Private Limited",
  tradeName: "Be Rare Cosmetics",
  brandName: "Berare",
  address: {
    line1: "VIII-237(1E), K. R. Complex",
    line2: "Sullia Kasaba Village, Near Private Bus Stand",
    city: "Sulya",
    district: "Dakshina Kannada",
    state: "Karnataka",
    pincode: "574239",
    country: "India",
  },
  phone: "+91 81236 05873",
  email: "berarecosmetics@gmail.com",
} as const

export function formatAddress() {
  const a = BUSINESS_INFO.address
  return `${a.line1}, ${a.line2}, ${a.city}, ${a.district}, ${a.state} ${a.pincode}, ${a.country}`
}
