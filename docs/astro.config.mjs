// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// Cloudflare Pages project responsive-areas-docs, built from docs/site.
	site: 'https://responsive-areas-docs.pages.dev',
	integrations: [
		starlight({
			title: 'ResponsiveAreas',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/deanleigh/Umbraco.Community.ResponsiveAreas' },
			],
			// Diátaxis sections, plus Decisions and the Build log.
			// Each section lists its folder automatically, so new pages need no config change.
			sidebar: [
				{ label: 'Introduction', slug: 'introduction' },
				{ label: 'Tutorials', items: [{ autogenerate: { directory: 'tutorials' } }] },
				{ label: 'How-to guides', items: [{ autogenerate: { directory: 'how-to' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
				{ label: 'Explanation', items: [{ autogenerate: { directory: 'explanation' } }] },
				{ label: 'Decisions', items: [{ autogenerate: { directory: 'decisions' } }] },
				{ label: 'Build log', items: [{ autogenerate: { directory: 'build-log' } }] },
			],
		}),
	],
});
