# @networkteam/zebra

🦓

## Release a new version:

### Pre-releases

To create a pre-release one can push/merge changes to branch `next`. This triggers actions to automatically create a pre-release.
Use `@next` as version in your project package.json to use the current pre-release.

### Releases

1. Merge your branch/changes into `main` branch
2. Bump version in `package.json` with `npm version [<newversion> | major | minor | patch`
3. Push bumped version including new tag to `main` branch with `git push --tags`
4. Create a new release with release notes from newly created tag on github
5. The new release will trigger GitHub Actions that will publish to NPM
