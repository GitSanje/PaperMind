import NextAuth from "next-auth";
import { CredentialsProvider, GoogleProvider } from "./providers";
import { client } from "@/db/redis";
import { db } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { RoleUser } from "@prisma/client";


export const { handlers, signIn, signOut, auth }= NextAuth({
  adapter: PrismaAdapter(db),
    providers: [GoogleProvider,CredentialsProvider],
    session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 Day
  },
  pages: {
    signIn: "/signin",
 
  },
   callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email;
        token.username = user.name;
        token.isOAuth = !!account;

         const userId = user.id;

         const userRedisKey = `google_users:${userId}`;

        const userDataToStore = {
          id: user.id,
          email: user.email || '', 
          name: user.name || '',
          image: user.image || '',
          provider: account?.provider || 'google', 

        };
        try {
         
          await client.hset(userRedisKey, userDataToStore);
          

          
        } catch (redisError) {
          console.error("Failed to save Google user data to Redis:", redisError);
        }
      }
   
  
     
      return token;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.username = token.username as string;
        session.user.role = token.role as RoleUser;
       
      }

      
      return session;
    },
}
    

})