import { useEffect } from 'react';

const SITE_NAME = 'Manitou Beach';
const SITE_URL = 'https://manitoubeachmichigan.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.jpg`;

/**
 * SEOHead - manages document head for SEO on each page.
 *
 * Props:
 *   title       - page title (will append " - Manitou Beach, Devils Lake Michigan")
 *   description - meta description (150-160 chars ideal)
 *   path        - canonical path, e.g. "/events"
 *   ogImage     - override OG image URL
 *   ogType      - override OG type (default "website")
 *   noindex     - if true, adds noindex robots meta
 *   schema      - JSON-LD object or array of objects to inject
 *   breadcrumbs - array of {name, path} for BreadcrumbList schema
 */
export default function SEOHead({ title, description, path, ogImage, ogType, noindex, schema, breadcrumbs }) {
  const fullTitle = title ? `${title} - Manitou Beach, Devils Lake Michigan` : 'Manitou Beach - Discover Devils Lake, Michigan';
  const canonical = path ? `${SITE_URL}${path}` : SITE_URL;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr, attrVal, content) => {
      let el = document.querySelector(`meta[${attr}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Core meta
    if (description) setMeta('name', 'description', description);
    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      const existing = document.querySelector('meta[name="robots"]');
      if (existing) existing.remove();
    }

    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    if (description) setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', ogType || 'website');

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    if (description) setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // Schema / JSON-LD
    // Clean up any previously injected SEO schemas
    document.querySelectorAll('script[data-seo-schema]').forEach(el => el.remove());

    const schemas = [];

    // BreadcrumbList
    if (breadcrumbs?.length) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      });
    }

    // Custom schema(s)
    if (schema) {
      if (Array.isArray(schema)) schemas.push(...schema);
      else schemas.push(schema);
    }

    schemas.forEach(s => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', 'true');
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-seo-schema]').forEach(el => el.remove());
    };
  }, [fullTitle, description, canonical, image, ogType, noindex, schema, breadcrumbs]);

  return null;
}

/**
 * Build Event schema JSON-LD from an event object (from /api/events).
 */
export function buildEventSchema(event) {
  if (!event?.name) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
  };

  if (event.date) {
    schema.startDate = event.time
      ? `${event.date}T${convertTo24h(event.time)}`
      : event.date;
  }
  if (event.dateEnd) schema.endDate = event.dateEnd;

  if (event.location) {
    schema.location = {
      '@type': 'Place',
      name: event.location.split(',')[0].trim(),
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location,
        addressLocality: 'Manitou Beach',
        addressRegion: 'MI',
        addressCountry: 'US',
      },
    };
  }

  if (event.description) schema.description = event.description.substring(0, 300);
  if (event.image) schema.image = event.image;

  const isFree = !event.cost || /free/i.test(event.cost);
  if (isFree) {
    schema.isAccessibleForFree = true;
  } else {
    schema.isAccessibleForFree = false;
  }

  if (event.attendance) {
    const needsRsvp = /rsvp|registration|limited/i.test(event.attendance);
    if (needsRsvp && event.rsvpLink) {
      schema.offers = {
        '@type': 'Offer',
        url: event.rsvpLink,
        availability: 'https://schema.org/InStock',
      };
    }
  }

  return schema;
}

function convertTo24h(timeStr) {
  if (!timeStr) return '00:00';
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '00:00';
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = (match[3] || '').toUpperCase();
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
}
