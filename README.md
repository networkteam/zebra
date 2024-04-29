<!--lint disable awesome-heading awesome-github awesome-toc double-link -->

<p align="center">
  <br>
  <img width="400" src="./docs/zebra_logo_dark.svg" alt="logo of zebra">
  <br>
  <br>
</p>

<h2 align='center'>@networkteam/zebra</h2>

<p align='center'>
A package for Next.js to use Neos CMS as a headless CMS with <b>full visual editing</b>.<br>
<br><br>

<a href='https://badge.fury.io/js/@networkteam%2Fzebra'>
<img src='https://badge.fury.io/js/@networkteam%2Fzebra.svg' alt='NPM version'>
</a>
</p>

<!--lint ignore-->

## Why?

* Neos is a great CMS with flexible content structures and focus on a streamlined, visual editing experience.
* Next.js offers a great developer experience and a full-stack framework to build modern websites and applications.

## Features

* Supports Next.js >= 12.2 with app or pages router
* Full support for content rendering via React server components (RSC)
* Provides components and helpers to load and render content from Neos CMS via React components
* Full editing and preview capabilities in the Neos UI using the frontend generated via Next.js
* Use multi-language sites with Neos and Next.js
* Supports multi-site setups (single Neos with sites, multiple Next.js instances)
* App code and content can be mixed

## How does it work?

This package is used inside a Next.js project that fetches content from Neos CMS for rendering and offers editing with full preview capabilities. It provides components and helpers to handle the loading and rendering of nodes. It adds the necessary editing metadata for the Neos UI to work as in a traditional Neos setup.

Inside Neos CMS a few supporting packages are used to provide the content via an API for Next.js and adjust the behavior of the Neos UI:

* [Networkteam.Neos.ContentApi](https://github.com/networkteam/Networkteam.Neos.ContentApi) for providing the content via a JSON API.
* [Networkteam.Neos.Next](https://github.com/networkteam/Networkteam.Neos.Next) for integrating Next.js as a preview of nodes and handle revalidation of changed documents on publishing.

## Installation

> Note: this readme focuses on using Zebra with the Next.js app router, as it is a more flexible approach for data-loading and supports React server components.

* Create or use an existing Next.js project
* Add `@networkteam/zebra` to your project
* Apply `withZebra` to your `next.config.js`:
  ```js
  /** @type {import('next').NextConfig} */

  const { withZebra } = require('@networkteam/zebra');

  const nextConfig = {
    reactStrictMode: true,
    // ...
  };

  module.exports = withZebra(nextConfig);
  ```
* Create a few pages and an API route for revalidation:
  * [`app/[[...slug]]/page.tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/app/[[...slug]]/page.tsx)
  * [`app/neos/preview/page.tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/app/neos/preview/page.tsx)
  * [`app/neos/previewNode/page.tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/app/neos/previewNode/page.tsx)
  * [`app/api/revalidate/route.ts`](https://github.com/networkteam/zebra-demo/blob/main/next/app/api/revalidate/route.ts)
* Set the environment variable `NEOS_BASE_URL` to your Neos installation and `PUBLIC_BASE_URL` to the public URL of your Next.js site.

## Further reading

See the **demo project** for a working example:

* [github.com/networkteam/zebra-demo](https://github.com/networkteam/zebra-demo)

And here's a list of articles with more background:

* [Zebra: Full editing with Neos and Next.js](https://networkteam.com/journal/2023/zebra-neos-and-next)
* [Zebra: A preview of Next.js 13 App Router and React Server Components](https://networkteam.com/journal/2023/zebra-nextjs-app-router-and-server-components)

## Configuration

### Environment variables

* `NEOS_BASE_URL`: The base URL of your Neos installation. This could be an internal URL that is not reachable from outside.
* `PUBLIC_BASE_URL`: The base URL of your Next.js site. This is the URL where your website will be reachable from outside.
* `REVALIDATE_TOKEN`: A secret token that will be used to validate calls to the revalidate API route.

## Rendering content

Zebra provides a `NodeRenderer` component to render a node from Neos.
You provide a mapping from node types to React components via `initNodeTypes` which should be imported in your root layout.
It is good practice to split components in *presentational* (no knowledge about Neos) and *content* components (adds Zebra components and helpers for editing capabilities on top of *presentational* components).

> Note: as React server components do not support `useContext`, we explicitly pass the `ctx` object to all components that need to access content.

### Example

**Define node type mappings (`lib/config/nodeTypes.ts`):**

```tsx
import { initNodeTypes } from '@networkteam/zebra/server';

import DocumentPage from '../components/document/Page';
import ContentHeadline from '../components/content/Headline';

initNodeTypes({
  // Documents
  'MyProject.Site:Document.Page': DocumentPage,

  // Content
  'Neos.NodeTypes:Headline': ContentHeadline,
});
```

**Create a dynamic route with optional catch-all (`app/[[...slug]]/page.tsx`):**

```tsx
import { loadDocumentPropsCached, NodeRenderer } from '@networkteam/zebra/server';
import { DataLoaderOptions } from '@networkteam/zebra/types';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

const dataLoaderOptionsFor = (routePath: string): DataLoaderOptions => ({
  cache: 'force-cache',
  next: {
    tags: ['document'],
  },
});

// This is for generating metadata
export async function generateMetadata({
  params,
}: {
  params: {
    slug: string[];
  };
}): Promise<Metadata> {
  const routePath = params.slug && Array.isArray(params.slug) ? params.slug.join('/') : '/';
  const neosData = await loadDocumentPropsCached(routePath, dataLoaderOptionsFor(routePath));
  if (!neosData) {
    return {};
  }

  const { node, site, meta } = neosData;
  const title = meta?.isRootPage ? site.properties.title : `${node.properties.title} – ${site.properties.title}`;
  return {
    title,
  };
}

// And this will render the page output
const Page = async ({ params: { slug } }: { params: { slug: string[] } }) => {
  const routePath = slug && Array.isArray(slug) ? slug.join('/') : '/';
  const dataLoaderOptions = dataLoaderOptionsFor(routePath);
  const neosData = await loadDocumentPropsCached(routePath, dataLoaderOptions);

  if (!neosData) {
    return notFound();
  }

  // Check for possible redirects
  if ('redirect' in neosData) {
    if (neosData.redirect.statusCode === 308 || neosData.redirect.statusCode === 301) {
      permanentRedirect(neosData.redirect.targetPath);
    }
    redirect(neosData.redirect.targetPath);
  }

  if (neosData?.node.nodeType === 'Neos.Neos:Shortcut') {
    return redirect(neosData.node.properties.targetUri || '/');
  }

  return (
    // Render the node data with NodeRenderer which uses the node type mappings
    <NodeRenderer
      ctx={{
        routePath,
        currentNodeIdentifier: neosData.node.identifier,
        documentNodeIdentifier: neosData.node.identifier,
        dataLoaderOptions,
      }}
      node={neosData.node}
    />
  );
};

export default Page;
```

**Add a component for a basic document page (`lib/components/document/Page.tsx`):**

```tsx
import { ContextProps } from '@networkteam/zebra';
import { ContentCollection } from '@networkteam/zebra/server';

import Header from './partials/Header';

const DocumentPage = ({ ctx }: { ctx: ContextProps }) => {
  const { mainNavigation } = await withMeta(ctx);
  const inBackend = ctx.inBackend;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        ctx={ctx}
        mainNavigation={mainNavigation}
        inBackend={inBackend}
      />

      <main className="flex grow flex-col justify-between">
        <ContentCollection className="grow" nodeName="main" ctx={ctx} />
      </main>
    </div>
  );
};

export default DocumentPage;
```

**Add a presentational component for a headline:**

```tsx
import classNames from 'classnames';

type HeadlineProps = {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
};

const Headline = ({ children, as: Component = 'h1', size, className }: HeadlineProps) => {
  return (
    <Component
      className={classNames(
        {
          'text-6xl': size === 'h1',
          'text-5xl': size === 'h2',
          'text-4xl': size === 'h3',
          'text-3xl': size === 'h4',
          'text-2xl': size === 'h5',
          'text-xl': size === 'h6',
        },
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Headline;
```

**Add a content component for a headline:**

```tsx
import { ContextProps } from '@networkteam/zebra';
import { ContentComponent, Editable, withNode } from '@networkteam/zebra/server';

import { baseClasses } from '@/lib/utils/baseClasses';

import Headline from '../ui/Headline';

const ContentHeadline = async ({ ctx }: { ctx: ContextProps }) => {
  const node = await withNode(ctx);

  return (
    <ContentComponent ctx={ctx} className={baseClasses(node)}>
      <Headline as={node.properties.hierarchy} size={node.properties.size}>
        <Editable ctx={ctx} property="title" />
      </Headline>
    </ContentComponent>
  );
};

export default ContentHeadline;
```

### Document rendering

<details>
  <summary>This is how the public view of the Next.js site is generated from content in Neos.</summary>

  Your Next.js project defines a [dynamic route with an optional catch-all segment](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#optional-catch-all-segments) that will render the page for a document node in Neos CMS. The route is defined in `app/[[...slug]]/page.tsx`.

  Next.js will fetch the node data for a document node from Neos via the Content API in `loadDocumentPropsCached`. You can implement custom processing based on the loaded data, e.g. to fetch additional data, handle shortcuts and redirects or to handle errors.

  Using the `NodeRenderer` a new `ctx` prop is passed with information about the current document / node identifier and route path as well as the data loader options for subsequent requests. This will be passed on to all React server components render content. The identifier will be changed while iterating over individual nodes (e.g. content collections).

  This data is the input for rendering the page, so the response of the Content API needs to contain needed information like menu items, shared content in e.g. a footer and the content of the page itself. With React server components you could also fetch additional data in the component itself.

  Next.js takes care of deduplicating identical fetch requests, so each component in the render tree can fetch data independently without causing additional requests.

  For this to work, the Neos base URL has to be known to Next.js via the `NEOS_BASE_URL` environment variable.
</details>

### Content editing in Neos UI

<details>
  <summary>This is how we the the Next.js frontend is used inside the Neos UI content module with full preview and editing capabilities.</summary>

  Now it get's a little trickier:

  You always access Neos CMS via your Next.js site by appending `/neos`, as usual.
  The `withZebra` config helper adds the necessary rewrites to the Next.js configuration in `next.config.js` to make this work.
  Next.js serves a custom `/neos/preview` route that is used to render the preview of a document node in the user workspace.
  It forwards your Neos session cookie to the Neos backend and fetches the content via the Content API - now with access to the user workspace and more metadata for use in Neos UI.

  By using the Zebra components and helpers for rendering, all the metadata for the Neos UI is added to the page. Inline editing should just work.

  All other requests to `/neos/*` (except `/neos/previewNode`) are proxied to the Neos backend.
</details>

### Caching and revalidation

<details>
  <summary>This is how on-demand revalidation is used if content changes are published in Neos.</summary>

  Content can be cached by specifying the data loader options in `loadPreviewDocumentProps`:

  ```typescript
  const dataLoaderOptionsFor = (routePath: string): DataLoaderOptions => ({
    cache: 'force-cache',
    next: {
      tags: ['document'],
    },
  });

  const neosData = await loadDocumentPropsCached(routePath, dataLoaderOptions);
  ```

  It requires the [Networkteam.Neos.Next](https://github.com/networkteam/Networkteam.Neos.Next) package in Neos. It hooks into the publishing signals, collects changed nodes and their closest document nodes and triggers a revalidation of the routes via a Next.js route handler (defaults to `/api/revalidate`). A revalidate token is used to prevent unauthorized revalidation requests.

  Note: For this to work, the Next.js base URL has to be known inside Neos.

  Since content often depends on other documents (e.g. document titles in navigation, teaser cards, etc.), it is advised to implement a _full revalidation_ after every change. With the app router, this will only mark routes as invalidated and they will be freshly rendered on the next request.

  Note: This approach works reasonably well and solves a lot of complexity with dependencies and figuring out an _exact_ set of document to revalidate.
</details>

### Preview of a single node (out of band rendering)

<details>
  <summary>A special case for previewing the content of a single node for inserting and updating content in Neos UI.</summary>

  We use the Next.js frontend again for previewing the content of a single node.
  To override the default behavior which uses Fusion inside a controller in Neos,
  the [Networkteam.Neos.Next](https://github.com/networkteam/Networkteam.Neos.Next)
  package provides a Fusion prototype that renders the content of a node via the Next.js frontend. A single Fusion path is used by Zebra in the metadata for all nodes to use this special preview implementation.

  For this to work, the Next.js base URL has to be known inside Neos.
</details>

## Development

Have a look at the [Zebra Demo](https://github.com/networkteam/zebra-demo) for a full setup of developing a Next.js project alongside Neos CMS in a monorepo.

Basically it boils down to:

* Run Neos CMS locally
* Run Next.js locally in development mode
* Set `NEOS_BASE_URL` to the URL of your local Neos
* Access Neos via the Next.js frontend at `/neos`

## Deployment

Deploying a site where content comes from Neos CMS and the actual frontend is generated in Next.js is a little bit more involved, since both systems work together when generating content or using the backend.

There are multiple things to consider:

* The Next.js frontend needs to be built and packaged:
  * If static pages are pre-built, the Neos CMS deployment has to be finished before the Next.js frontend can be built.
  * Another, simpler approach is, to not generate static content here and use an env variable like `CI` to opt-out of caching (by calling a function like `headers`). This can be used e.g. in `not-found.tsx` which would cause build errors otherwise, see [`not-found.tsx` in Zebra demo](https://github.com/networkteam/zebra-demo/tree/main/next/app/not-found.tsx).
* Next.js needs to be accessible via a public URL, but requests to Neos should also use this URL to generate correct absolute links and resolve sites:
  * Neos must be accessible from Next.js via another URL - which could be purely internal (e.g. a Kubernetes Service).
  * This is why `PUBLIC_BASE_URL` is provided to the Next.js frontend, which will set `X-Forwarded-*` proxy headers for Neos.
  * Check that your `trustedProxies` configuration in Neos allows this.
* Some paths should be routed to Neos (`/neos`, `/_Resources`) and others to Next.js (`/neos/preview`, `/`). In Kubernetes this can be solved at the Ingress level.

### Multi-site caveats

* You have to add the publicly used base URL as the primary domain to each site in Neos (via backend module or Flow CLI).
* Next.js needs to know about the publicly used base URL via the `PUBLIC_BASE_URL` env var to make sure URIs are generated correctly for revalidate calls to the content API in Neos.
* Your Neos will need to accept proxy headers from Next.js, make sure to allow it in `Neos.Flow.http.trustedProxies` in `Settings.yaml`.

## Pages router

Please have a look at https://github.com/networkteam/zebra/blob/v0.9.0/README.md to see previous instructions for using the pages router.

## Contributing

We are happy to accept contributions. Just open an issue or pull request.

### Releasing a new version

<details>
<summary>Pre-release</summary>

To create a pre-release you can push / merge changes to branch `next`. This triggers actions to automatically create a pre-release.
Use `@next` as version in your project `package.json` to use the current pre-release.
</details>

<details>
<summary>Tagged release</summary>

1. Merge your branch / changes into `main` branch
2. Bump version in `package.json` with `npm version [<newversion> | major | minor | patch`
3. Push bumped version including new tag to `main` branch with `git push --follow-tags`
4. Create a new release with release notes from newly created tag on github
5. The new release will trigger GitHub Actions that will publish to NPM
</details>

## 🙏 Appreciation

Special thanks to Philip Schmidt ([@esdete2](https://github.com/esdete2)) for initiating and pushing the full-editing approach and implementing the first Zebra project in his spare-time.

## License

[MIT](./LICENSE.md)
