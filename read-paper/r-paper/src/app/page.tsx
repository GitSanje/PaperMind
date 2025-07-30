import LandingPage from "@/components/ui/landing";
import { auth } from "@/middleware";
import Image from "next/image";

export  default async function Home() {
 const session = await auth()
  return (
  <LandingPage user={session!}/>
  );
}
