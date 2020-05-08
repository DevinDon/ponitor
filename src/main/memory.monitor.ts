import { execSync } from 'child_process';
import { mem } from 'systeminformation';
import { logger } from './logger';

export class MemoryMonitor {

  private times: number = 0;

  constructor() { }

  async getFree() {
    return Math.round((await mem()).free / 1024 / 1024);
  }

  run() {

    logger.info('memory monitor starting...');

    // per 10 seconds
    setInterval(async () => {

      /** Free memory */
      const free = await this.getFree();

      // memory is not enough
      if (free < 100) {
        logger.warn(`Free Memory: ${free} MB`);
        execSync('sync; echo 1 | sudo tee /proc/sys/vm/drop_caches');
        logger.info(`Free Memory: ${await this.getFree()} MB`);
      }

      // log memory every 60 times
      if (this.times++ % 60 === 0) {
        logger.info(`Free Memory: ${free} MB`);
      }

    }, 10 * 1000);

    logger.info('memory monitor started');

  }

}
