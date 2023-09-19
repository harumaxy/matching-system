import * as oak from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { object, safeParse, string } from "npm:valibot";
import { channel, queue } from "../lib/queue.ts";
import * as redis from "../lib/redis.ts";
import { ticketSchema } from "../lib/match.ts";

const app = new oak.Application();
const router = new oak.Router();

router.post("/match/join", async (ctx) => {
  const reqBody = safeParse(ticketSchema, await ctx.request.body().value);

  if (!reqBody.success) {
    return badRequest(ctx);
  }

  channel.publish(
    { routingKey: queue },
    {},
    new TextEncoder().encode(JSON.stringify(reqBody.output))
  );

  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/subscribe/:user_id", async (ctx) => {
  const user_id = ctx.params.user_id;
  if (!user_id) {
    return badRequest(ctx);
  }
  const result = await redis.getMatchingResult(user_id);
  ctx.response.body = result;
  ctx.response.status = result ? 200 : 404;
});

function badRequest(ctx: oak.Context) {
  ctx.response.status = 400;
  ctx.response.body = "Bad request";
}

app.use(router.routes());
app.use(router.allowedMethods());
console.log("Listening on http://localhost:8000");
app.listen({ port: 8000 });
