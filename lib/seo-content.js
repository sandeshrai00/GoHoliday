import { delhiDeparture } from './seo-data/delhi-departure';
import { indiaDepartures } from './seo-data/india-departures';
import { nepalDepartures } from './seo-data/nepal-departures';
import { durationBased } from './seo-data/duration-based';
import { travelTypes } from './seo-data/travel-types';
import { combinations } from './seo-data/combinations';
import { visaCosts } from './seo-data/visa-costs';
import { reverseRoutes } from './seo-data/reverse-routes';

// Combine all modularized SEO data
const seoPages = [
    ...delhiDeparture,
    ...indiaDepartures,
    ...nepalDepartures,
    ...durationBased,
    ...travelTypes,
    ...combinations,
    ...visaCosts,
    ...reverseRoutes
];

export function getSeoPageData(slug) {
    return seoPages.find(page => page.slug === slug);
}

export function getAllSeoSlugs() {
    return seoPages.map(page => page.slug);
}
