import { Redis } from "ioredis";

export const client = new Redis("redis://localhost:6379");
client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

