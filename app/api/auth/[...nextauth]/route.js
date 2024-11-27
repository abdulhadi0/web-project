import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/mongodb-connect';
import User from '../../../../lib/user-model';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" }
      },
      async authorize(credentials) {
        try {
          console.log("Started Login process");
          
          // Enhanced input validation
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          // Trim and lowercase email for consistency
          const email = credentials.email.trim().toLowerCase();

          // Connect to database
          await connectDB();
          console.log("DB Connected Successfully for Login process");
          
          // Find user
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error('No user found with this email');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
         
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
          };
        } catch (error) {
          console.error('Authentication error:', error.message);
          return null;
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      // Add user details to token on first login
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Populate session with token data
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.email = token.email;
      }
      console.log(session); 
      return session;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin' // Custom error page
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Optional: Add error handling and logging
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email);
    },
    async signOut(message) {
      console.log('User signed out:', message.user.email);
    },
    async createUser(message) {
      console.log('New user created:', message.user.email);
    }
  },
  
  // Optional: Add debug logging for development
  debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };