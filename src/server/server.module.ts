import { Module } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ViewModule } from './view/view.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AppModule, ViewModule, PrismaModule],
  providers: [],
})
export class ServerModule {}
