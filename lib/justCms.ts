import { PUBLIC_JUSTCMS_TOKEN, PUBLIC_JUSTCMS_PROJECT } from '$env/static/public';

//
// Type definitions
//

// Categories
export interface Category {
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

// Images
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export interface Image {
  alt: string;
  variants: ImageVariant[];
}

// Pages
export interface PageSummary {
  title: string;
  subtitle: string;
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface PagesResponse {
  items: PageSummary[];
  total: number;
}

// Content Blocks
export interface HeaderBlock {
  type: 'header';
  styles: string[];
  header: string;
  subheader: string | null;
  size: string;
}

export interface ListBlock {
  type: 'list';
  styles: string[];
  options: {
    title: string;
    subtitle?: string | null;
  }[];
}

export interface EmbedBlock {
  type: 'embed';
  styles: string[];
  url: string;
}

export interface ImageBlock {
  type: 'image';
  styles: string[];
  images: {
    alt: string;
    variants: ImageVariant[];
  }[];
}

export interface CodeBlock {
  type: 'code';
  styles: string[];
  code: string;
}

export interface TextBlock {
  type: 'text';
  styles: string[];
  text: string;
}

export interface CtaBlock {
  type: 'cta';
  styles: string[];
  text: string;
  url: string;
  description?: string | null;
}

export interface CustomBlock {
  type: 'custom';
  styles: string[];
  blockId: string;
  [key: string]: any;
}

export type ContentBlock =
  | HeaderBlock
  | ListBlock
  | EmbedBlock
  | ImageBlock
  | CodeBlock
  | TextBlock
  | CtaBlock
  | CustomBlock;

export interface PageDetail {
  title: string;
  subtitle: string;
  meta: {
    title: string;
    description: string;
  };
  coverImage: Image | null;
  slug: string;
  categories: Category[];
  content: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

// Menus
export interface MenuItem {
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  styles: string[];
  children: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

// Page filters
export interface PageFilters {
  category: {
    slug: string;
  };
}

//
// Integration: createJustCms
//
/**
 * createJustCms
 *
 * Provides methods for fetching JustCMS data:
 * - getCategories()
 * - getPages()
 * - getPageBySlug()
 * - getMenuById()
 *
 * The API token and project ID are taken either from environment variables
 * (PUBLIC_JUSTCMS_TOKEN and PUBLIC_JUSTCMS_PROJECT) or from the optional parameters.
 */
export function createJustCms(apiToken?: string, projectIdParam?: string) {
  const token = apiToken || PUBLIC_JUSTCMS_TOKEN;
  const projectId = projectIdParam || PUBLIC_JUSTCMS_PROJECT;

  if (!token) {
    throw new Error('JustCMS API token is required');
  }
  if (!projectId) {
    throw new Error('JustCMS project ID is required');
  }

  // Base URL without the project segment.
  const BASE_URL = 'https://api.justcms.co/public';

  /**
   * Helper: Makes a GET request to a JustCMS endpoint.
   * @param endpoint The endpoint (e.g. 'pages' or 'menus/main')
   * @param queryParams Optional query parameters.
   */
  const get = async <T>(
    endpoint: string = '',
    queryParams?: Record<string, any>
  ): Promise<T> => {
    const url = new URL(
      `${BASE_URL}/${projectId}${endpoint ? '/' + endpoint : ''}`
    );
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JustCMS API error ${response.status}: ${errorText}`);
    }
    return response.json();
  };

  /**
   * Retrieves all categories.
   */
  const getCategories = async (): Promise<Category[]> => {
    const data = await get<CategoriesResponse>();
    return data.categories;
  };

  /**
   * Retrieves pages with optional filtering and pagination.
   */
  const getPages = async (params?: {
    filters?: PageFilters;
    start?: number;
    offset?: number;
  }): Promise<PagesResponse> => {
    const query: Record<string, any> = {};
    if (params?.filters?.category?.slug) {
      query['filter.category.slug'] = params.filters.category.slug;
    }
    if (params?.start !== undefined) {
      query['start'] = params.start;
    }
    if (params?.offset !== undefined) {
      query['offset'] = params.offset;
    }
    return get<PagesResponse>('pages', query);
  };

  /**
   * Retrieves a single page by its slug.
   */
  const getPageBySlug = async (
    slug: string,
    version?: string
  ): Promise<PageDetail> => {
    const query: Record<string, any> = {};
    if (version) {
      query['v'] = version;
    }
    return get<PageDetail>(`pages/${slug}`, query);
  };

  /**
   * Retrieves a single menu by its ID.
   */
  const getMenuById = async (id: string): Promise<Menu> => {
    return get<Menu>(`menus/${id}`);
  };

  //
  // Utility functions
  //
  const isBlockHasStyle = (
    block: { styles: string[] },
    style: string
  ): boolean => {
    return block.styles.map((s) => s.toLowerCase()).includes(style.toLowerCase());
  };

  const getLargeImageVariant = (image: Image): ImageVariant => {
    return image.variants[1];
  };

  const getFirstImage = (block: { images: Image[] }): Image => {
    return block.images[0];
  };

  const hasCategory = (page: PageDetail, categorySlug: string): boolean => {
    return page.categories.map((category) => category.slug).includes(categorySlug);
  };

  return {
    getCategories,
    getPages,
    getPageBySlug,
    getMenuById,
    isBlockHasStyle,
    getLargeImageVariant,
    getFirstImage,
    hasCategory
  };
}
