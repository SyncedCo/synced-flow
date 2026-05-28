# Why Synced Flow?

AI can build front ends quickly. The harder problem is keeping those front ends consistent once a project has more than one page, one template, one developer, or one coding agent.

Synced Flow exists for that gap.

It gives humans and AI coding agents a shared CSS contract: tokens, fluid scales, layout primitives, website recipes, accessibility defaults, and CLI checks that keep the work inside the system.

## The problem

Most websites do not become inconsistent all at once.

They drift.

One section gets a custom spacing value. Another gets a one-off colour. A third gets a breakpoint patch because the first two nearly worked. AI-assisted development can make that drift happen faster because it is very good at generating plausible CSS.

Plausible is not the same as systemised.

Synced Flow is designed to reduce the number of styling decisions made from scratch during a build.

## The position

Synced Flow is not trying to be a Tailwind clone, a Bootstrap replacement, or a React component library.

It is an AI-native fluid CSS design system for brand-consistent websites and agency builds.

Use it when you want:

- fluid type and spacing before breakpoint patches
- brand tokens before one-off colours
- layout primitives before custom wrappers
- accessible defaults before decorative resets
- source-scanned utilities before shipping a large universal stylesheet
- project-local agent guidance before asking AI to guess the styling rules

## What it gives an AI coding agent

Most CSS frameworks document for humans. Synced Flow also gives coding agents a discoverable styling contract.

Useful surfaces include:

- `catalog --json` for machine-readable class and token discovery
- `suggest` for finding matching primitives and recipes
- `recipe` and `pattern` for generating known page sections
- `lint` for spotting drift from the system
- `doctor` for setup checks
- `agents install` for adding project-local AI guidance
- a packaged Synced Flow skill for coding agents that support skill files

The result is not magic. It is constraint.

The agent gets fewer opportunities to invent a second design system inside the first one.

## What it gives agencies

Agencies need systems that work across real client projects, not just React demos.

Synced Flow supports:

- WordPress themes and plugins
- PHP and template scanning
- enqueue-ready CSS output
- Next
- Astro
- Vite
- plain HTML
- reusable website patterns

That makes it useful for brand-led websites, local business sites, campaign pages, portfolios, SaaS landing pages, and agency delivery systems.

## What it gives developers

Synced Flow gives developers a practical CSS foundation with modern defaults:

- CSS custom properties
- cascade layers
- OKLCH colour tokens
- `clamp()` based fluid scales
- logical properties
- container-aware layout primitives
- reduced-motion safeguards
- visible focus states
- modular CSS exports
- generated utilities based on real project usage

You can import the full stylesheet for speed, or import only the layers a project needs.

## Comparison in one line

- Tailwind gives you utilities.
- Bootstrap gives you a complete responsive toolkit.
- shadcn/ui gives you owned components.
- Synced Flow gives you an owned, fluid, agent-readable CSS system for brand-consistent websites.

## The practical promise

Build quickly without handing every spacing, colour, and responsive decision to a blank page.

That is the point of Synced Flow.
