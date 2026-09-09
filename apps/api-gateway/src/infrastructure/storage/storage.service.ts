import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { storageConfig } from '../../config/configuration';
import { STORAGE_CLIENT } from '../../infrastructure/storage/storage.provider';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_CLIENT) private s3: S3Client,
    @Inject(storageConfig.KEY) private config: ConfigType<typeof storageConfig>,
  ) {}

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ key: string; url: string }> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    );

    const url = `${this.config.useSSL ? 'https' : 'http'}://${this.config.endpoint}:${this.config.port}/${this.config.bucket}/${key}`;
    return { key, url };
  }

  async deleteByKey(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );
  }

  async deleteByUrl(fileUrl: string): Promise<void> {
    const url = new URL(fileUrl);
    const key = url.pathname.replace(`/${this.config.bucket}/`, '');
    await this.deleteByKey(key);
  }

  async delete(fileUrl: string): Promise<void> {
    // extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.replace(`/${this.config.bucket}/`, '');

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
    );
  }
  getUrl(key: string): string {
    return `${this.config.useSSL ? 'https' : 'http'}://${this.config.endpoint}:${this.config.port}/${this.config.bucket}/${key}`;
  }
}
