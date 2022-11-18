# @networkteam/zebra

🦓

## Why?

* Neos is a great CMS with flexible content structures and focus on a streamlined editing experience
* Next.js offers a great developer experience and a way to build modern websites and applications with a mixed form of static and dynamic pages

So why not combine the best of both worlds?

Our question was: Can we retain the editing experience of Neos while using Next.js for the frontend? And the answer is: Yes, we can!

## Installation

See our demo project for a working example.

TODO Publish demo project ;)

## How does it work?

This package is used inside a Next.js project that uses Neos CMS for rendering of content and editing with full preview capabilities. It provides components and hooks to handle the rendering of nodes and adding editing metadata for the Neos UI.

Inside Neos CMS a few supporting packages are used to provide the necessary data for the frontend and change the behavior of the Neos UI:

* [Networkteam.Neos.ContentApi](https://github.com/networkteam/Networkteam.Neos.ContentApi) for providing the content via a JSON API
* [Networkteam.Neos.Next](https://github.com/networkteam/Networkteam.Neos.Next) for integrating Next.js for preview of nodes and handle revalidation of generated content on publishing

### Static site generation
<details>
  <summary>This is how the public view of the Next.js site is generated from content in Neos.</summary>

  Your Next.js project defines a [dynamic catch all route](https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes) that will generate pages for document nodes in Neos CMS. The route is defined in `pages/[[...slug]].tsx`.

  Next.js will fetch a list of all document nodes from Neos via the Content API in `getStaticProps` for the `[[...slug]]` route.

  The `getStaticProps` function will then be called for each page with the `path` and `locale` as params.
  The data for the page will be fetched via the Content API in Neos by the path and locale.
  This data is the input for rendering the page, so the response of the Content API needs to contain all needed information like menu items, shared content in e.g. a footer and the content of the page itself.
</details>

### Content editing in Neos UI

TODO Describe how the Neos UI is integrated

### Revalidation

TODO Describe how revalidation on publishing works

### Preview of a single node (out of band rendering)

TODO Describe how preview of a single node works

## Development

TODO Write about development setup of a Neos / Next project

## Deployment

TODO Write about deployment of a Neos / Next project

## Release a new version

### Pre-releases

To create a pre-release one can push/merge changes to branch `next`. This triggers actions to automatically create a pre-release.
Use `@next` as version in your project package.json to use the current pre-release.

### Releases

1. Merge your branch/changes into `main` branch
2. Bump version in `package.json` with `npm version [<newversion> | major | minor | patch`
3. Push bumped version including new tag to `main` branch with `git push --tags`
4. Create a new release with release notes from newly created tag on github
5. The new release will trigger GitHub Actions that will publish to NPM

## License

[MIT](./LICENSE.md)
