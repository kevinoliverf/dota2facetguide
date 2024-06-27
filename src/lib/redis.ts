import { RedisClientType, createClient } from 'redis';


let client: RedisClientType | null = null;

const redisConnect = async () => {
  if (client !== null) {
    return client
  }
  if (
    process.env.REDIS_HOST === undefined ||
    process.env.REDIS_PORT === undefined) {
    throw new Error('Redis environment variables not set')
  }
  client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      connectTimeout: 500,
      reconnectStrategy: function(retries) {
        if (retries > 5) {
            console.log("Too many attempts to reconnect. Redis connection was terminated");
            return new Error("Too many retries.");
        } else {
            return retries * 500;
        }
    }
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
