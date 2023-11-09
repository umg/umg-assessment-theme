# *Stanza* Shopify 2.0 Theme

A barebones Shopify 2.0 theme meant to be a simple starting point for coding challenges or internal projects. Less clutter than the Dawn theme, so you can focus on what you're building.

## Purpose

- Coding challenges. Enough to start, but not too much to overwhelm.
- Could be useful for internal projects.
- A place to experiment with new features, techniques, tools, etc...

## Getting Started

1. **Installation**: Clone this repo or download the theme into your Shopify development environment. Make sure you have the [Shopify CLI](https://shopify.dev/themes/tools/cli) installed.
2. **Development**: Run `npm install` to install dependencies, then `npm start` to build/watch assets and start the Shopify local development server (runs in parallel).

## What's Included

In addition to some basic sections and settings, **Stanza** includes the following features:

- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **TypeScript**: For type safety and better code completion.
- **Webpack**: For bundling assets and compiling TypeScript.

You'll find the standard Shopify 2.0 theme structure, but many of the templates are empty, containing only a placeholder section. Exceptions are:
- `index.json`: Homepage template with a grid of all products.
- `404.json`: Not found template with a link back to the collection containing all products.
- `collection.json`: Collection template with a grid of products in the collection.
- `list-collections.json`: List collections template with a grid of all collections.
- `password.json`: Password template with a form to unlock a password-protected store.

You'll also find a header section and a footer section, which are included in the `theme.liquid` layout.

## Notes for Applicants

- Familiarize yourself with the Shopify theme structure and Liquid templating.
- Focus on the challenge requirements. Don't worry about building a complete theme.
- Make sure your customizations are responsive and meet basic performance and accessibility standards.

## Additional Information

- This theme is intended primarily for internal use at UMG. While it's built on Shopify 2.0 standards, it's tailored for specific use cases and may not include all features found in a full-fledged theme.
