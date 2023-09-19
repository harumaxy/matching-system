import { match } from "../lib/match.ts";
import { channel, queue } from "../lib/queue.ts";
import * as redis from "../lib/redis.ts";

channel.consume({ queue, noAck: false }, async (args, props, data) => {
  const ticket = JSON.parse(new TextDecoder().decode(data));
  await channel.ack({ deliveryTag: args.deliveryTag });
  redis.setCandidate(ticket.user_id, ticket);
});

async function doMatch() {
  const candidates = await redis.listCandidates();
  const { established, mismatched } = match(candidates);
  console.log("established groups: ", established.length);
  console.log("mismatched players: ", mismatched.length);

  for (const user of established.flat()) {
    await redis.client.del(redis.candidateKey(user.user_id));
    await redis.setMatchingResult(user.user_id);
  }
}

const matchInterval = 3000;
while (true) {
  await doMatch();
  await new Promise((resolve) => setTimeout(resolve, matchInterval));
}
