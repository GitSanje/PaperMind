
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/schemas";
import bcrypt from "bcryptjs";

export const GoogleProvider = Google({
  clientId: process.env.GOOGLE_ID as string,
  clientSecret: process.env.GOOGLE_SECRET as string,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      role: 'User',
      
    };
  },
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code",
    },
  },
});


export const CredentialsProvider = Credentials({
  async authorize(credentials) {

    
   
      const validatedFields = signInSchema.safeParse(credentials);
     
      if (validatedFields.success) {
        const { email, password } = validatedFields.data;
  
      
          const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return {
        success: false,
        error: {
        code: 401,
        message: "Invalid credentials.",
      },
      };
    }
        if (!user || !user.password) return null;
  
        const passwordsMatch = await bcrypt.compare(password, user.password);
  
        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.first_name+'_'+user.last_name,
            email: user.email,
            role: user.role,
            isOAuth: false,
          };
        }
      }
    
    return null;
  },
});
