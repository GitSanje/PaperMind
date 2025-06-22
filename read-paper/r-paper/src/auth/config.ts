import {

  CredentialsProvider,
  GoogleProvider,
} from "@/auth/providers";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [ GoogleProvider,CredentialsProvider],
  trustHost:true
} satisfies NextAuthConfig;
