import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiry: process.env.JWT_ACCESS_EXPIRY,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY,
}));

export const redisConfig = registerAs('redis', () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL is required');
  }

  return { url };
});

export const storageConfig = registerAs('storage', () => ({
  endpoint: process.env.STORAGE_ENDPOINT,
  port: Number(process.env.STORAGE_PORT),
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
  bucket: process.env.STORAGE_BUCKET,
  useSSL: process.env.STORAGE_USE_SSL === 'true',
  region: process.env.STORAGE_REGION,
}));

export const kafkaConfig = registerAs('kafka', () => ({
  brokers: process.env.KAFKA_BROKERS?.split(','),
  clientId: process.env.KAFKA_CLIENT_ID,
  consumerGroupId: process.env.KAFKA_CONSUMER_GROUP_ID,
  sslEnabled: process.env.KAFKA_SSL_ENABLED === 'true',
}));

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(10).required(),
  JWT_ACCESS_EXPIRY: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().min(10).required(),
  JWT_REFRESH_EXPIRY: Joi.string().required(),

  REDIS_URL: Joi.string().required(),

  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().required(),
  KAFKA_CONSUMER_GROUP_ID: Joi.string().required(),
  KAFKA_SSL_ENABLED: Joi.boolean().default(false),

  STORAGE_ENDPOINT: Joi.string().required(),
  STORAGE_PORT: Joi.number().required(),
  STORAGE_ACCESS_KEY: Joi.string().required(),
  STORAGE_SECRET_KEY: Joi.string().required(),
  STORAGE_BUCKET: Joi.string().required(),
  STORAGE_USE_SSL: Joi.boolean().default(false),
  STORAGE_REGION: Joi.string().default('us-east-1'),
});
