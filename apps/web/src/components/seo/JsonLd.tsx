/**
 * Renders JSON-LD structured data for SEO.
 * Content is server-generated schema data, not user input — safe for injection.
 */
export default function JsonLd({ data }: { data: Record<string, any> | Record<string, any>[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
