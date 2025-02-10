# JustCMS Svelte Integration

A simple, type-safe integration for [JustCMS](https://justcms.co) in your Svelte (SvelteKit) project. This integration provides a single module that wraps the JustCMS public API endpoints, making it easy to fetch categories, pages, and menus.

## Features

- **TypeScript Support:** Fully typed structures for API responses.
- **Single Module:** All JustCMS API calls are encapsulated in one module.
- **Easy Integration:** Configure your API token and project ID via environment variables.
- **Flexible Endpoints:** Supports fetching categories, pages (with filtering and pagination), a page by its slug, and a menu by its ID.

## Installation

1. **Add the Module:**

   Copy the `src/lib/justCms.ts` file into your project's `src/lib` directory.

2. **Install Dependencies:**

   Ensure your project is set up for TypeScript and SvelteKit. If not, refer to the [SvelteKit documentation](https://kit.svelte.dev/docs).

## Configuration

Set your JustCMS API token and project ID as environment variables. Create a `.env` file in your project's root directory with the following:

```
PUBLIC_JUSTCMS_TOKEN=YOUR_JUSTCMS_API_TOKEN
PUBLIC_JUSTCMS_PROJECT=YOUR_JUSTCMS_PROJECT_ID
```

Note: In SvelteKit, environment variables prefixed with \`PUBLIC_\` are exposed to the client.

## Usage

The integration is provided as a module that exports a \`createJustCms\` function. You can import it into any component or module and call its functions to fetch data from JustCMS.

### Example Component

Below is a simple example that fetches and displays categories:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createJustCms } from '$lib/justCms';

  const justCms = createJustCms();
  let categories = [];

  onMount(async () => {
    categories = await justCms.getCategories();
  });
</script>

<template>
  <div>
    <h2>Categories</h2>
    <ul>
      {#each categories as category (category.slug)}
        <li>{category.name}</li>
      {/each}
    </ul>
  </div>
</template>
```

### Available Functions

#### getCategories()
Fetches all categories for your project.

```ts
const categories = await justCms.getCategories();
// Returns: Category[]
```

#### getPages(params?: { filters?: { category: { slug: string } }, start?: number, offset?: number })
Fetches pages with optional filtering and pagination.

```ts
// Get all pages
const pages = await justCms.getPages();

// Get pages filtered by a specific category
const blogPages = await justCms.getPages({
  filters: { category: { slug: 'blog' } }
});
```

#### getPageBySlug(slug: string, version?: string)
Fetches a specific page by its slug.

```ts
const page = await justCms.getPageBySlug('about-us');
// Returns: PageDetail
```

#### getMenuById(id: string)
Fetches a menu and its items by ID.

```ts
const menu = await justCms.getMenuById('main-menu');
// Returns: Menu
```

#### Utility Functions

- **isBlockHasStyle(block, style):** Checks if a content block has a specific style (case-insensitive).

```ts
const isHighlighted = justCms.isBlockHasStyle(block, 'highlight');
```

- **getLargeImageVariant(image):** Gets the large variant of an image (the second variant in the array).

```ts
const largeVariant = justCms.getLargeImageVariant(image);
```

- **getFirstImage(block):** Gets the first image from an image block.

```ts
const firstImage = justCms.getFirstImage(imageBlock);
```

- **hasCategory(page, categorySlug):** Checks if a page belongs to a specific category.

```ts
const isBlog = justCms.hasCategory(page, 'blog');
```

## API Endpoints Overview

The module wraps the following JustCMS API endpoints:

- **Get Categories:** Retrieve all categories for your project.
- **Get Pages:** Retrieve pages with optional filtering and pagination.
- **Get Page by Slug:** Retrieve detailed information about a specific page.
- **Get Menu by ID:** Retrieve a menu and its items by its unique identifier.

For more details on each endpoint, refer to the [JustCMS Public API Documentation](https://justcms.co/api).
