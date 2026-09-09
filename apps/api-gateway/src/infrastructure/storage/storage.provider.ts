import { S3Client } from '@aws-sdk/client-s3';
import { ConfigType } from '@nestjs/config';
import { storageConfig } from '../../config/configuration';

export const STORAGE_CLIENT = 'STORAGE_CLIENT';

export const storageProviders = [
  {
    provide: STORAGE_CLIENT,
    inject: [storageConfig.KEY],
    useFactory: (config: ConfigType<typeof storageConfig>): S3Client => {
      return new S3Client({
        endpoint: `http${config.useSSL ? 's' : ''}://${config.endpoint}:${config.port}`,
        region: config.region, // MinIO requires a region, value doesn't matter
        credentials: {
          accessKeyId: config.accessKey!,
          secretAccessKey: config.secretKey!,
        },
        forcePathStyle: true, // required for MinIO
      });
    },
  },
];
