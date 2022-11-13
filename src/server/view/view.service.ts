import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextServer } from 'next/dist/server/next';
import next from 'next';

@Injectable()
export class ViewService implements OnModuleInit {
  private server: NextServer;

  constructor(private configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    try {
      this.server = next({
        dev: this.configService.get<string>('NODE_ENV') !== 'production',
        dir: 'src/client',
      });
    } catch (e) {
      console.log(e);
    }
  }

  getNextServer(): NextServer {
    return this.server;
  }
}