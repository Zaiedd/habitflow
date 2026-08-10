import { ConfigService } from '@nestjs/config';
import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
  console.log(
    `HabitFlow API listening on http://localhost:${port} (docs: /docs)`,
  );
}

void bootstrap();
