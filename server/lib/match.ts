import { type Output, enumType, object, string } from "npm:valibot";

// Constants

export const ranks = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
] as const;
export const game_modes = ["1on1", "4on4", "coop"] as const;
export const ticketSchema = object({
  user_id: string(),
  game_mode: enumType(game_modes),
  rank: enumType(ranks),
});

// Types

export type GameMode = (typeof game_modes)[number];

export type Ticket = Output<typeof ticketSchema>;

interface MatchOutput {
  established: Ticket[][];
  mismatched: Ticket[];
}

type MatchFunction = (a: Ticket, b: Ticket) => boolean;

// Functions

function maxPlayersOf(mode: GameMode) {
  switch (mode) {
    case "1on1":
      return 2;
    case "4on4":
      return 8;
    case "coop":
      return 4;
  }
}

function matchRecursive(
  candidates: Ticket[],
  established: Ticket[][],
  mismatched: Ticket[]
): MatchOutput {
  if (candidates.length === 0) {
    return { established, mismatched };
  }

  const [head, tail] = [candidates[0], candidates.slice(1)];
  const maxPlayers = maxPlayersOf(head.game_mode);
  const opponents = tail
    .filter((candidate) => condition(head, candidate))
    .slice(0, maxPlayers - 1);
  const group = [head, ...opponents];

  if (group.length === maxPlayers) {
    const machedIds = group.map((c) => c.user_id);
    const newTail = tail.filter((c) => !machedIds.includes(c.user_id));
    return matchRecursive(newTail, [...established, group], mismatched);
  } else {
    return matchRecursive(tail, established, [...mismatched, head]);
  }
}

function condition(a: Ticket, b: Ticket): boolean {
  // Add custom matching logics here !
  return a.game_mode === b.game_mode && a.rank === b.rank;
}

export function match(tickets: Ticket[]) {
  return matchRecursive(tickets, [], []);
}
