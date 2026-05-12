# NutriWise - Personalized Nutritional Guidance

A culturally grounded, medically safe nutritional guidance PWA for underserved communities in Nigeria.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

## Deploying to Vercel

### Option 1: One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/da-viee/nutri-diet&project-name=nutri-diet&repo=da-viee/nutri-diet)

### Option 2: Manual deployment

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Run the deploy command from the project root:
```bash
vercel --prod
```

### Prerequisites for Deployment

- Make sure you have Node.js installed (version 18 or newer recommended)
- Ensure all dependencies are properly installed (`npm install`)
- Verify the build works locally (`npm run build`)

## Features

- Culturally-aware nutrition guidance
- Personalized meal planning
- Local food database integration
- Responsive design for mobile and desktop
- PWA capabilities for offline access

## Tech Stack

- Next.js 16.2.6
- React 19.2.4
- Tailwind CSS
- TypeScript
- Supabase for data storage