# OTMS (Online Test Management System)

This is a [Next.js](https://nextjs.org) project for managing online tests, built with TypeScript, Prisma, and Tailwind CSS.

## Features

- **User Authentication**: Role-based access (Student, Teacher, Admin)
- **Test Management**: Create, assign, and manage tests
- **Student Testing**: Take tests with timer and auto-submission
- **Score Tracking**: View test scores with analytics and filtering
- **Real-time Updates**: Live score updates and test status

## Recent Updates

### Role-Based Redirect System
- **Global Layout Integration**: Automatic role-based routing for all authenticated users
- **Security**: Prevents unauthorized access to role-specific pages
- **User Experience**: Seamless redirects to appropriate dashboards
- **Cross-Dashboard Protection**: Students can't access teacher pages and vice versa

### Student Dashboard Redesign
- **Simplified Layout**: Only 2 main widgets - "View My Scores" and "Available Tests"
- **Separate Tests Page**: `/student/tests` - Dedicated page for viewing and taking tests
- **Smart Filtering**: API automatically filters out tests students have already taken
- **Enhanced UX**: Clean navigation and improved test-taking experience

### Test Scores Feature
- **API Endpoint**: `/api/scores` - Fetches all test scores with role-based access
- **Scores Page**: `/scores` - Modern UI with search, filtering, and analytics
- **Role-based Views**: Teachers see all student scores, students see only their own
- **Analytics**: Summary statistics including average, highest, and lowest scores

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
