import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

const redisConnect = async() => {
  if (!client) {
    client = createClient();
    await client.connect();
  }
  return client;
};

export default redisConnect;

