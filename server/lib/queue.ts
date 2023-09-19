import { connect } from "https://deno.land/x/amqp@v0.23.1/src/amqp_connect.ts";

const queue = "user_pool";
const connection = await connect();
const channel = await connection.openChannel();

await channel.declareQueue({ queue });

export { channel, queue };
