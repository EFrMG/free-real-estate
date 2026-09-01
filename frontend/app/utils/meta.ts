import type { MetaDescriptor } from "react-router";

// Each matched route's `meta` array replaces its ancestors' rather than adding to it. Since `root.tsx` is the only place declaring the OG/Twitter tags, any child route exporting its own `meta` wipes them. Child routes must merge the inherited meta (via `matches`) themselves
// `matches` here is the whole chain *including the current route*, whose own entry is still an empty placeholder (its `meta` is only filled in after this function returns) — so the immediate parent, already carrying the fully-cascaded meta of everything above it, is the second-to-last entry
export function mergeMeta(
  matches: readonly ({ meta?: MetaDescriptor[] } | undefined)[],
  overrides: { title: string; description: string },
): MetaDescriptor[] {
  const parentMeta = matches[matches.length - 2]?.meta ?? [];

  const REPLACED_NAMES = new Set([
    "description",
    "twitter:title",
    "twitter:description",
  ]);
  const REPLACED_PROPERTIES = new Set(["og:title", "og:description"]);

  const inherited = parentMeta.filter((tag) => {
    if ("title" in tag) return false;
    const name = "name" in tag ? String(tag.name) : undefined;
    const property = "property" in tag ? String(tag.property) : undefined;
    if (name && REPLACED_NAMES.has(name)) return false;
    if (property && REPLACED_PROPERTIES.has(property)) return false;
    return true;
  });

  return [
    ...inherited,
    { title: overrides.title },
    { name: "description", content: overrides.description },
    { property: "og:title", content: overrides.title },
    { property: "og:description", content: overrides.description },
    { name: "twitter:title", content: overrides.title },
    { name: "twitter:description", content: overrides.description },
  ];
}
