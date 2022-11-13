import { Controller, Get, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { parse } from 'url';

import { ViewService } from './view.service';

@Controller('/')
export class ViewController {
  constructor(private viewService: ViewService) {}

  @Get('/')
  public async index(@Req() req: Request, @Res() res: Response): Promise<void> {
    const parsedUrl = parse(req.url, true);
    const serverSideProps = { dataFromController: 'ABC' }

    await this.viewService
      .getNextServer()
      .render(
        req,
        res,
        parsedUrl.pathname,
        Object.assign(parsedUrl.query, serverSideProps),
      );
  }

  @Get('_next*')
  public async assets(@Req() req: Request, @Res() res: Response): Promise<void> {
    const parsedUrl = parse(req.url, true);
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }
}