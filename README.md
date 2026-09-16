## Ster Schoonmaak

Phase 3B service pages for the Ster Schoonmaak production website. The Dutch and English homepage, services overview and all 12 launch service routes are live; non-service shells remain intentionally deferred.

### Prerequisites

- Node.js 24.x (or a current Next.js 16-compatible LTS)
- npm 11.x

### Development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The Dutch route is `/`; the English route is `/en`.

### Verification commands

```bash
npm run typecheck
npm run lint
npm run build
```

### Structure

```text
src/
  app/              Next.js App Router routes and global styles
  components/layout/ Shared top bar, header, navigation, shell, and footer
  components/home/  Homepage sections and conversion content
  components/services/ Overview, reusable service-page compositions, and breadcrumbs
  components/shared/ Brand logo and unfinished route shell components
  components/ui/    Small accessible UI primitives
  config/           Typed brand, business, and service registry configuration
  i18n/             next-intl routing and request configuration
  proxy.ts          Locale-aware routing proxy
messages/           Locale message files (`nl-BE`, `en-BE`)
public/brand/       Official PNG logo handoff location
```

Business configuration lives in `src/config/site.ts`. Unknown contact, social, legal, hours, and address values are explicitly `null`; no private address or invented contact details are rendered.

The locale strategy uses `next-intl` with `nl-BE` as the default locale and `en-BE` as the secondary locale. Dutch omits the locale prefix where supported, while English uses `/en/...`.

The service registry in `src/config/services.ts` is the single source for service IDs, launch order, completion status, localized route mapping, images, audiences, areas, and related-service relationships. All 12 launch services are complete and link from the overview. To add a future service, add its registry entry and matching localized content first, then create its page wrapper only when its content is complete. User-facing translations remain in `messages/nl-BE.json` and `messages/en-BE.json`; the small fallback content module supplies the new page copy without changing the existing message architecture.

The completed indexable service routes are `/diensten` plus the 12 localized service paths in the registry and their English `/en/services...` equivalents. Existing preparation shells such as `/zakelijk`, `/werkgebied`, `/over-ons`, `/contact`, and `/offerte` remain `noindex,nofollow` until their content is built.

The supplied official PNG logo is available at `public/brand/ster-schoonmaak-logo.png` and is used without alteration. The original supplied copy is retained at `brand/ster-schoonmaak-logo.png`.

The global shell is composed in `src/components/layout/site-shell.tsx` and is shared by all localized routes. Navigation labels and shell copy live in the locale message files. Localized pathname mappings live in `src/i18n/routing.ts`; locale-aware navigation wrappers live in `src/i18n/navigation.ts`.

Contact and social controls are rendered only when their values are configured in `src/config/site.ts`. Null values produce no unsafe placeholder links or disabled fake actions.

### Deferred to later phases

Phase 3B includes the eight remaining service pages. The Business Cleaning hub, real contact/quote form, uploads, Supabase, email, Turnstile, analytics, cookie consent, reviews, legal-policy content, and CMS/admin functionality remain intentionally deferred to later phases. Phase 3C has not started.

Local photo sources and attribution are documented in `public/images/README.md`; remote image hotlinks are not used.
