import { connect } from "https://deno.land/x/redis/mod.ts";
import { Ticket } from "./match.ts";

export const candidateKey = (user_id: string) => `candidates:${user_id}`;
export const resultKey = (user_id: string) => `results:${user_id}`;

const redis = await connect({
  hostname: "127.0.0.1",
  port: 6379,
});

async function setMatchingResult(user_id: string) {
  await redis.set(
    resultKey(user_id),
    JSON.stringify({
      result: "ok",
      match_id: "string",
      match_string: "string",
      IP: "x.x.x.x",
      port: 1234,
    })
  );
}

async function getMatchingResult(user_id: string) {
  return JSON.parse((await redis.get(resultKey(user_id))) ?? "null");
}

export async function setCandidate(user_id: string, ticket: Ticket) {
  await redis.set(candidateKey(user_id), JSON.stringify(ticket));
}

export async function listCandidates() {
  const keys = await redis.keys(candidateKey("*"));

  if (keys.length === 0) {
    return [];
  }
  const candidates = await redis.mget(...keys);
  return candidates.map((candidate) => JSON.parse(candidate as any));
}

export { redis as client, setMatchingResult, getMatchingResult };
