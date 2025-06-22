import { signInSchema, signupSchema } from "@/schemas";
import { z } from "zod";

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;