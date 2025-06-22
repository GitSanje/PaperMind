"use client";

import { useState, useTransition } from "react";

// ───── Icons ─────
import { BrainCircuit, Eye, EyeOff, ListTodo, Loader, Lock, User } from "lucide-react";

// ───── UI Components (shadcn) ─────
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@radix-ui/react-separator";
import { toast } from "sonner";

// ───── Validation (Zod & React Hook Form) ─────


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInFormData } from "@/types";
import { signInSchema } from "@/schemas";
import { signInCred, singnInGoogle } from "@/actions/user";
import Link from "next/link";
import { useRouter } from "next/navigation";



export default function LoginPage() {

  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);


   const router = useRouter()
  //Using useForm hook with Zod validation via zodResolver for handling form state and validation errors.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema), // Integrate Zod validation
  });
   
   // function to handlle form submission
   const onSubmit = async (data: SignInFormData) => {
    startTransition(async () => {
      try {
        const result = await signInCred(data);
        
        if (result?.success) {
            // Redirect if session is valid
            setTimeout(() => {
              router.push("/pdf-view");
               toast.success("You cant now surf the PaperMind");
            }, 1500);
          
        } else {
          toast.error(  "Error creating account");
        }
      } catch (error) {
        toast.error("Something went wrong. Try again.");
      }
    });
  };

  const googleSignIn = async() => {
      await singnInGoogle ()
      setTimeout(() => {
              router.push("/pdf-view");
               toast.success("You cant now surf the PaperMind");
            }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <BrainCircuit
                className="h-10 w-10 text-primary"
                size={"48px"}
                strokeWidth={2}
              />
            </div>
          </div>
          <CardTitle className="text-2xl text-indigo-500">PaperMind</CardTitle>
          <CardDescription>
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="name@company.com"
                  className="pl-9"
                />
              </div>
              {errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="pl-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full" />
              <span className="relative bg-card px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>

            
                   <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 hover:bg-muted/50"
              disabled={false}
              onClick={googleSignIn}
            >
              <GoogleIcon className="h-4 w-4" />
              <span>Sign in with Google</span>
            </Button>

        
         
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-2 ">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader
                  className="h-10 w-10 animate-spin text-gray-200"
                  size="48px"
                  strokeWidth={4}
                />
              ) : (
                "Sign in"
              )}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}