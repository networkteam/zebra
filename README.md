[![npm version](https://badge.fury.io/js/@networkteam%2Fzebra.svg)](https://badge.fury.io/js/@networkteam%2Fzebra)
# @networkteam/zebra

🦓

## Why?

* Neos is a great CMS with flexible content structures and focus on a streamlined editing experience
* Next.js offers a great developer experience and a way to build modern websites and applications with a mixed form of static and dynamic pages

So why not combine the best of both worlds?

Our question was: Can we retain the editing experience of Neos while using Next.js for the frontend? And the answer is: Yes, we can!

## Features

* No frontend rendering in Neos CMS - it's used headless, besides providing the Neos UI
* Use React components for rendering the frontend based on content (node properties) from Neos - your own components with a few helpers and hooks for editing
* Full editing and preview capabilities in the Neos UI using the frontend generated via Next.js
* Use multi-language sites with Neos and Next.js
* Supports multi-site setups (single Neos with sites, multiple Next.js instances)

## How does it work?

This package is used inside a Next.js project that fetches content from Neos CMS for rendering and offers editing with full preview capabilities. It provides components and hooks to handle the rendering of nodes and adding editing metadata for the Neos UI.

Inside Neos CMS a few supporting packages are used to provide the content via an API for Next.js and adjust the behavior of the Neos UI:

* [Networkteam.Neos.ContentApi](https://github.com/networkteam/Networkteam.Neos.ContentApi) for providing the content via a JSON API.
* [Networkteam.Neos.Next](https://github.com/networkteam/Networkteam.Neos.Next) for integrating Next.js as a preview of nodes and handle revalidation of changed documents on publishing.

We also published some supporting tools:

* [github.com/networkteam/grazer](https://github.com/networkteam/grazer) is an HTTP service implementing a specialized priority queue to revalidate pages for changed documents reliably.

## Installation

* Create or use an existing Next.js project
* Add `@networkteam/zebra` to your project
* Apply `withZebra` to your `next.config.mjs` (we only expose an ESM module, so the Next.js config needs to use the `.mjs` extension):
  ```js
  import { withZebra } from '@networkteam/zebra';

  export default withZebra({
    // your next config
  });
  ```
* Create a few pages and an API route for revalidation:
  * [`pages/[[...slug]].tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/pages/[[...slug]].tsx)
  * [`pages/neos/preview.tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/pages/neos/preview.tsx)
  * [`pages/neos/previewNode.tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/pages/neos/previewNode.tsx)
  * [`pages/api/revalidate.ts`](https://github.com/networkteam/zebra-demo/blob/main/next/pages/api/revalidate.ts)
* Configure a custom document or add `<BackendContainer />` to your existing [`pages/_document.tsx`](https://github.com/networkteam/zebra-demo/blob/main/next/pages/_document.tsx)
* Set the environment variable `NEOS_BASE_URL` to your Neos installation

## Further reading

See the **demo project** for a working example:

* [github.com/networkteam/zebra-demo](https://github.com/networkteam/zebra-demo)

And here's a list of articles with more background:

* [Zebra: Full editing with Neos and Next.js](https://networkteam.com/journal/2023/zebra-neos-and-next)

## Configuration

### Environment variables

* `NEOS_BASE_URL`: The base URL of your Neos installation. This could be an internal URL that is not reachable from outside.
* `PUBLIC_BASE_URL`: The base URL of your Next.js site. This is the URL where your website will be reachable from outside.
* `REVALIDATE_TOKEN`: A secret token that will be used to validate calls to the revalidate API route.
* `REVALIDATE_CONCURRENCY`: How many concurrent revalidations should be performed. Defaults to `2`.

## Rendering content

Zebra provides a `Frontend` component to render a document from Neos.
You provide a mapping from node types to React components.
It is good practice to split components in *presentational* (no knowledge about Neos) and *integrational* components (adds Zebra components and hooks for editing capabilities on top of *presentational* components).

### Example

Define node type mappings:

```tsx
import DocumentPage from '../components/document/Page';
import ContentHeadline from '../components/content/Headline';

export const nodeTypes = {
  // Documents
  'MyProject.Site:Document.Page': DocumentPage,

  // Content
  'Neos.NodeTypes:Headline': ContentHeadline,
};
```

Component for a basic document page:

```tsx
import {
  ContentCollection,
  ContentComponent,
  NeosContentNode,
  NeosContext,
  useMeta,
  useSiteNode,
} from '@networkteam/zebra';
import { useContext } from 'react';

import Header from './partials/Header';

const DocumentPage = () => {
  const meta = useMeta();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        mainNavigation={meta?.mainNavigation}
      />

      <main className="flex grow flex-col justify-between">
        <ContentCollection className="grow" nodeName="main" />
      </main>
    </div>
  );
};

export default DocumentPage;
```

Presentational component for a headline:

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

Integrational component for a headline:

```tsx
import { ContentComponent, Editable, useNode } from '@networkteam/zebra';

import Headline from '../ui/Headline';

const ContentHeadline = () => {
  const node = useNode();
  return (
    <ContentComponent>
      <Headline as={node.properties.hierarchy} size={node.properties.size}>
        <Editable property="title" />
      </Headline>
    </ContentComponent>
  );
};

export default ContentHeadline;
```

### Static site generation

<details>
  <summary>This is how the public view of the Next.js site is generated from content in Neos.</summary>

  Your Next.js project defines a [dynamic catch all route](https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes) that will generate pages for document nodes in Neos CMS. The route is defined in `pages/[[...slug]].tsx`.

  Next.js will fetch a list of all document nodes from Neos via the Content API in `getStaticProps` for the `[[...slug]]` route.

  The `getStaticProps` function will then be called for each page with the `path` and `locale` as params.
  The data for the page will be fetched via the Content API in Neos by the path and locale.
  This data is the input for rendering the page, so the response of the Content API needs to contain all needed information like menu items, shared content in e.g. a footer and the content of the page itself.

  For this to work, the Neos base URL has to be known to Next.js via the `NEOS_BASE_URL` environment variable.
</details>

### Content editing in Neos UI

<details>
  <summary>This is how we the the Next.js frontend is used inside the Neos UI content module with full preview and editing capabilities.</summary>

  Now it get's a little trickier:

  You always access Neos CMS via your Next.js site by appending `/neos`, as usual.
  The `withZebra` config helper adds the necessary rewrites to the Next.js configuration in `next.config.js` to make this work.
  Next.js serves a custom `/neos/preview` route that is used to render the preview of a workspace version of a document node.
  It forwards your Neos session cookie to the Neos backend and fetches the content via the Content API - now with access to the user workspace and much more metadata for use in Neos UI.

  This is not done statically - as it would not allow to access the current request and user session - but on demand via `getServerSideProps`.

  By using the Zebra components and hooks for rendering, all the metadata for the Neos UI is added to the page. Inline editing should just work.

  All other requests to `/neos/*` (except `/neos/previewNode`) are proxied to the Neos backend.
</details>

### Revalidation

<details>
  <summary>This is how incremental static regeneration (ISR) is used if content changes are published in Neos.</summary>

  This is done by the [Networkteam.Neos.Next](https://github.com/networkteam/Networkteam.Neos.Next) package in Neos. It hooks into the publishing signals, collects changed nodes and their closest document nodes and triggers a revalidation of the pages via a Next.js API route (defaults to `/api/revalidate`). A revalidate token is used to prevent unauthorized revalidation requests.

  Note: For this to work, the Next.js base URL has to be known inside Neos.

  Since content often depends on other documents (e.g. document titles in navigation, teaser cards, etc.), it is advised to implement a _full revalidation_ after every change. This is why we developed [grazer](https://github.com/networkteam/grazer): it receives revalidate requests from Neos at `/api/revalidate` and handles revalidation requests of all other documents to Next.js in the background. It uses a priority queue that prioritizes older and explicit revalidate route paths before other route paths that are revalidated for consistency.

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
  * Another, simpler approach is, to not generate static content here and use an env variable like `CI` to control if static paths / props are fetched from Neos. It works well with `fallback: 'blocking'`, since that will request static props on demand if not yet cached. Bundled with [grazer](https://github.com/networkteam/grazer) an initial revalidation can be performed that will cache all static pages _after Neos and Next are deployed_.
* Next.js needs to be accessible via a public URL, but requests to Neos should also use this URL to generate correct absolute links and resolve sites.
  Neos must be accessible form Next.js via another URL - which also could be purely internal (e.g. a Kubernetes Service).
  This is why `PUBLIC_BASE_URL` is provided to the Next.js frontend, which will set `X-Forwarded-*` proxy headers for Neos.
  Check that your `trustedProxies` configuration in Neos allows this.
* Some paths should be routed to Neos (`/neos`, `/_Resources`) and others to Next.js (`/neos/preview`, `/`). In Kubernetes this can be solved at the Ingress level.

TODO Write more about deployment of a Neos / Next project

### Multi-site caveats

* You have to add the publicly used base URL as the primary domain to each site in Neos (via backend module or Flow CLI).
* Next.js needs to know about the publicly used base URL via the `PUBLIC_BASE_URL` env var to make sure URIs are generated correctly for revalidate calls to the content API in Neos.
* Your Neos will need to accept proxy headers from Next.js, make sure to allow it in `Neos.Flow.http.trustedProxies` in `Settings.yaml`.

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
3. Push bumped version including new tag to `main` branch with `git push --tags`
4. Create a new release with release notes from newly created tag on github
5. The new release will trigger GitHub Actions that will publish to NPM
</details>

## 🙏 Appreciation

Special thanks to Philip Schmidt ([@esdete2](https://github.com/esdete2)) for initiating and pushing the full-editing approach and implementing the first Zebra project in his spare-time.

## License

[MIT](./LICENSE.md)
