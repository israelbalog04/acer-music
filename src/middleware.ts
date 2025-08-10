import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Middleware logic if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protéger les routes /app/*
        if (req.nextUrl.pathname.startsWith('/app')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/app/:path*']
};