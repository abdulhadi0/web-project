const authConfig = {
    providers: [], // Placeholder for providers
    pages: {
      signIn: '/auth/signin',
    },
    callbacks: {
      async authorized({ auth, request }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');
        
        if (isOnDashboard) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to sign-in
        }
        
        return true;
      },
    },
  };
  
  export { authConfig };