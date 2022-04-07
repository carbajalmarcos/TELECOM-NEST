import { NestFactory } from '@nestjs/core';
import { DbDataSeederModule } from './db-data-seeder.module';
import { DbDataSeederService } from './db-data-seeder.service';

async function bootstrap() {
  NestFactory.createApplicationContext(DbDataSeederModule)
    .then((appContext) => {
      const seeder = appContext.get(DbDataSeederService);
      seeder
        .seed()
        .then(() => {
          console.info('Seeding complete!');
        })
        .catch((error) => {
          console.info('Seeding failed!');
          throw error;
        })
        .finally(() => appContext.close());
    })
    .catch((error) => {
      throw error;
    });
}
bootstrap();
