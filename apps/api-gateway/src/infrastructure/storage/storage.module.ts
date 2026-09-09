import { Global, Module } from '@nestjs/common';
import { storageProviders } from './storage.provider';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [...storageProviders, StorageService],
  exports: [...storageProviders, StorageService],
})
export class StorageModule {}
