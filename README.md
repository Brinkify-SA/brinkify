# brinkify-sa

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Self, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Biome** - Linting and formatting
- **PWA** - Progressive Web App support
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
npm install
```


Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see your fullstack application.
Use the Expo Go app to run the mobile application.







## Project Structure

```
brinkify-sa/
├── apps/
│   └── web/         # Fullstack application (Next.js)
│   ├── native/      # Mobile application (React Native, Expo)

```

## Tech Stack
- Supabase for Auth, DB and Storage - It can scale based on the plan subscribed to.
- Emails from [Brevo.com](https://brevo.com), affordable transactional emails
- SMS from [Twilio](https://www.twilio.com/en-us/messaging/channels/sms)
- Subscriptions from [Payfast.io](https://www.payfast.io)
- Next.js for full stack development, API is created in the [`apps/web/src/app/api`](/apps/web/src/app/api/) folder.
  
- Should the api need to be served to an external client, you should update the [middleware](/apps/web/src/middleware.ts) CORS settings to allow that client.
- 

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run check-types`: Check TypeScript types across all apps
- `npm run dev:native`: Start the React Native/Expo development server
- `npm run check`: Run Biome formatting and linting
- `cd apps/web && npm run generate-pwa-assets`: Generate PWA assets
