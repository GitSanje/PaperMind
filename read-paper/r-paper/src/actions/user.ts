"use server";

import bcrypt from "bcryptjs"; 
import axios from "axios";

import { SignInFormData, SignupFormData } from "@/types";
import { signIn, signOut } from "../auth";
import { signInSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { db } from "@/db/prisma";
 
export const signup = async (data: SignupFormData) => {
  try {
    const { first_name, last_name, email, password } = data;

    // Check if the email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "This email is already taken!",
      };
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    await db.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "Successfully signed up!",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        return {
          success: false,
          message:
            error.response.data.message || "This email is already taken!",
        };
      } else {
        return {
          success: false,
          message:
            "An error occurred while signing up. Please try again later.",
        };
      }
    } else {
      console.error("Signup Error:", error);
      return {
        success: false,
        message: "An unexpected error occurred.",
      };
    }
  }
};

export const singnInGoogle= async()=> await signIn("google",{
redirectTo : `${process.env.NEXTAUTH_URL}/pdf-view `
})
export const signInCred = async (data: SignInFormData) => {
  try {
     const validatedFields = signInSchema.safeParse(data);
    if(!validatedFields.success) {
    return {
      success: false,
      error: {
        code: 422,
        message: "Invalid fields.",
      },
    };
  }
    const { email, password } = validatedFields.data;

    // Step 1: Find user by email
    const user = await db.user.findUnique({
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

    // Step 2: Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        error: {
        code: 401,
        message: "Invalid credentials.",
      },
      };
    }



  
    return await signInCredentials(email,password);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: error.response.data.message,
        };
      } else {
        return {
          success: false,
          message: "An error occurred while logging in. Please try again later.",
        };
      }
    } else {
      console.error("Sign-in error:", error);
      return {
        success: false,
        message: "An unexpected error occurred.",
      };
    }
  }
};
export async function handleServerSignOut() {
  await signOut();
}


// Sign in credentials from next-auth
export const signInCredentials = async (email:string,password:string) => {
  try {
    const result = await signIn("credentials", {
      email, 
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: {
          code: 401,
          message: "Invalid credentials.",
        },
      };
    }

    return {
      success: true,
      code: 200,
      message: "Login successful.",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: {
              code: 401,
              message: "Invalid credentials.",
            },
          };
        // ... other cases ...
        default:
          console.error(error);
          return {
            success: false,
            error: {
              code: 500,
              message: "An unexpected error occurred.",
            },
          };
      }
    }
    console.error(error);
    return {
      success: false,
      error: {
        code: 500,
        message: "An unexpected error occurred.",
      },
    };
  }
};
