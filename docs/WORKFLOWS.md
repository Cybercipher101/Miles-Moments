# A little guide to GitHub Actions

The three workflows suggested by GitHub are now configured for Miles & Moments. They are **manual tools**: adding code, pushing a commit, or creating a release does not publish a package. None deploys the website to GitHub Pages or Sites.

## Choose a workflow

| Workflow in the Actions tab | What it does | First run |
| --- | --- | --- |
| [Publish Node.js Package to npm](../.github/workflows/npm-publish.yml) | Prepares a package for the npm registry; can publish through npm trusted publishing | Keep **Preview the package without publishing** checked |
| [Publish Node.js Package to GitHub Packages](../.github/workflows/github-packages.yml) | Prepares `@cybercipher101/miles-moments` for GitHub's package registry | Keep the preview checkbox checked |
| [SLSA Generic generator](../.github/workflows/slsa-provenance.yml) | Creates a downloadable archive and a signed statement identifying its digest and build workflow | Run manually on `main`; no package-registry setup needed |

These distribute a copy of the frontend. The application remains HTML, CSS, and vanilla JavaScript. Node runs development commands and the local preview server.

## Your first preview

1. Open [this repository's Actions tab](https://github.com/Cybercipher101/Miles-Moments/actions).
2. Select either publishing workflow, then choose **Run workflow**.
3. Select **main**. Leave the preview checkbox checked. For npm, enter a lowercase scoped name you own, such as `@your-npm-name/miles-moments`.
4. Wait for validation and packaging to finish. Open the run to read each step's output.
5. Download **miles-moments-package** from the run's Artifacts section. Extract that ZIP, then extract the `.tgz` inside it.
6. Open a terminal in the extracted `package/` folder and run `npm start`. Visit `http://localhost:5500`.

A dry run checks the archive and publish command. It does **not** establish that a registry will accept your credentials, package name, visibility settings, or version. Artifacts are retained for 14 days.

## Before publishing to npm

The default `@cybercipher101/miles-moments` is a suggested scope; ownership on npm has not been established. GitHub and npm usernames do not have to match.

Use an npm account and package scope you control. In the npm package's settings, configure a GitHub Actions trusted publisher for:

| Setting | Value |
| --- | --- |
| GitHub user | `Cybercipher101` |
| Repository | `Miles-Moments` |
| Workflow filename | `npm-publish.yml` |
| Environment | Leave empty; this workflow does not use an environment |
| Publishing permission | Allow direct `npm publish` if npm presents this choice |

If this is a brand-new package, complete npm's package creation/first-publication process under your own account before configuring its package-level trusted publisher. This account setup is separate from adding the workflow. Do not put an npm password or token into the repository.

The workflow uses a GitHub-hosted runner, Node 24, npm 11.16.0, OIDC, and public package provenance. No `NPM_TOKEN` is used. After the preview looks right and npm is configured, run it again with the same package name and uncheck the preview box. See [npm's trusted publishing guide](https://docs.npmjs.com/trusted-publishers/) for account-side configuration and current requirements.

## Before publishing to GitHub Packages

The workflow uses the repository's automatically supplied `GITHUB_TOKEN` with `packages: write`; no personal access token needs to be committed or added for this repository-owned package. It associates the package with `Cybercipher101/Miles-Moments` through its manifest. Existing packages must permit this repository to publish updates. See [GitHub's Node.js package guide](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).

After a successful preview, uncheck the preview box to publish. GitHub package visibility is a separate setting from repository visibility: check the package's settings if you want it public. This update keeps the repository public and does not create or change a registry package.

## Versions and archive contents

The package version comes from the root `package.json`. Before publishing a new version, run `npm version patch --no-git-tag-version`, review both package files, then commit and push them. Registries generally reject publishing an already-used package name/version combination.

The root project stays `private: true` to prevent accidental publication of the entire checkout. The packaging script creates a separate manifest in an ignored `.cache/release-*` folder. It includes:

- The tracked `dist/` website: 15 HTML pages, styles, JavaScript, 18 WebP images, and local fonts with their licenses.
- `scripts/serve.mjs` and an `npm start` command.
- A small package README and package metadata, without development dependencies.

Tests, screenshot albums, `.git`, `.env`, browser profiles, and development dependencies are outside the archive. The project has no selected open-source license, so the generated manifest says `UNLICENSED`; publishing does not grant a new license. Font licenses are preserved.

To inspect the package on your computer, with Node and Git installed:

```sh
npm run package:preview
npm run test:package
```

The first command prints the archive path, file list, and SHA-256 digest. It never publishes. Generated files remain in `.cache/`, which Git ignores. Optional environment variables are `PACKAGE_NAME` and `PACKAGE_REGISTRY` (`npm` or `github`). The GitHub target accepts only this repository's fixed scope.

## What the SLSA workflow adds

It packages the current `main` revision, computes a SHA-256 digest, and passes that digest to the pinned SLSA generic generator. Download both the package artifact and the generated `miles-moments.intoto.jsonl` provenance artifact from the completed run. Release uploads are disabled.

The statement can be used to check the archive's origin and integrity using the [SLSA verifier](https://github.com/slsa-framework/slsa-verifier). Follow the [generic generator documentation](https://github.com/slsa-framework/slsa-github-generator/blob/v2.1.0/internal/builders/generic/README.md) for its provenance format. This configuration alone is not evidence that a signed run has succeeded or that the entire application is SLSA-certified. This archive is separate from an npm publication; do not assume provenance for another run covers different bytes.

## Checks and boundaries

Each workflow runs the six application unit tests, source checks, documentation references, and three packaging integration tests before producing its archive. Browser tests remain available through `npm run test:browser`; they are not part of these packaging workflows.

Workflows run only when manually requested for this repository's `main` branch. Publishing workflows default to preview and serialize runs per registry. GitHub actions are pinned to commit SHAs; the SLSA reusable workflow uses the exact `v2.1.0` tag required by its verifier. Permissions are scoped per job. The SLSA generator requests `contents: write` for compatibility with its reusable workflow, even though release uploads are disabled.

**Local verification, 22 October 2026:** three packaging tests and six application unit tests passed; source checks and documentation references passed; actionlint 1.7.12 accepted all three workflows. Archive hashes and contents were checked for both registries. Both `npm publish --dry-run` commands completed successfully, with the expected unauthenticated dry-run warning. Registry publication and GitHub-hosted signing have not been run. Check the Actions run itself before claiming a published package or signed provenance.
