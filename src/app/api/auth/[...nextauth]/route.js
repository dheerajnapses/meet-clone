import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google'; // Import Google provider for authentication
import GithubProvider from 'next-auth/providers/github'; // Import GitHub provider for authentication
import User from '@/models/User'; // Import the User model from your application models
import dbConnect from '@/lib/dbConnect'; // Import database connection function

// Define NextAuth options (configurations)
export const authOptions = {
  // List of authentication providers
  providers: [
    // Google provider configuration with clientId and clientSecret from environment variables
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // GitHub provider configuration with clientId and clientSecret from environment variables
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  // Callbacks to customize behavior after authentication
  callbacks: {
    // JWT callback to modify the JWT token
    async jwt({ token, user, account }) {
      // If user exists, add user ID to the token
      if (user) {
        token.id = user.id;
      }
      // If account exists (e.g., during authentication), add access token to the JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      return token; // Return the modified token
    },

    // Session callback to modify session data sent to the client
    async session({ session, token }) {
      session.user.id = token.id; // Add user ID from the JWT token to the session
      return session; // Return the modified session
    },

    // Sign-in callback to handle database operations when a user signs in
    async signIn({ user, profile }) {
      // Ensure connection to the database
      await dbConnect();

      // Try to find the user in the database based on their email
      let dbUser = await User.findOne({ email: user.email });
      // If the user is not found, create a new user in the database
      if (!dbUser) {
        dbUser = await User.create({
          name: profile.name, // Set the name from the profile
          email: profile.email, // Set the email from the profile
          profilePicture: profile.picture, // Set the profile picture from the profile
          isVerified: profile.email_verified ? true : false, // Set if the email is verified
        });
      }
      // Add the database user ID to the user object used in NextAuth
      user.id = dbUser._id.toString();
      return true; // Return true to indicate the sign-in is successful
    },
  },

  // Session strategy is set to 'jwt' to use JSON Web Tokens for session management
  session: {
    strategy: 'jwt', // Use JWT for session handling
    maxAge: 90 * 24 * 60 * 60, // Set the session to expire after 90 days
  },

  // Specify custom pages for authentication
  pages: {
    signIn: '/user-auth', // Custom sign-in page URL
  },
};

// Create the NextAuth handler with the defined options
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests to handle authentication
export { handler as GET, handler as POST };
