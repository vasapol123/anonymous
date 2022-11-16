import { Module } from '@nestjs/common';

import { ViewController } from './view.controller';
import { ViewService } from './view.service';

@Module({
  imports: [],
  controllers: [ViewController],
  providers: [ViewService],
})
export class ViewModule {}
