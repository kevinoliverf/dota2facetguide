import { RedisClientType, createClient } from 'redis';


let client: RedisClientType | null = null;

const redisConnect = async () => {
  if (client !== null) {
    return client
  }
  client = createClient({
    socket: {
      connectTimeout: 500,
    }
  });
  client.on('error', error => console.error(`${new Date().toISOString()} - Redis client error:`, error));
  try {
    await client.connect()
  } catch (error) {
    console.error('Error connecting to Redis:', error)
    throw error
  }
  return client;
};

export default redisConnect;
