import { NestFactory } from '@nestjs/core';
import { DbBackuperModule } from './db-backuper.module';
import { DbBackuperService } from './db-backuper.service';

async function bootstrap() {
  const app = await NestFactory.create(DbBackuperModule);
  const service = app.get(DbBackuperService);
  service.startBackupAndMigration();
  await app.listen(3232);
}
bootstrap();
