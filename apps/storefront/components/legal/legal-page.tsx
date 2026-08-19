export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-16">
      <h1 className="font-heading text-3xl mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {updatedAt}</p>
      <div className="space-y-8 text-sm leading-relaxed text-foreground/90 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:mb-0 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  )
}
