import { exec } from 'child_process';
import { networkInterfaces } from 'systeminformation';
import { logger } from './logger';

export interface Times {
  total: number;
  error: number;
  restart: number;
}

export interface Option {
  maxError: number;
  maxRestart: number;
  host: string;
  interval: number;
}


export class NetworkMonitor {

  private readonly MAXERROR: number;
  private readonly MAXRESTART: number;
  private readonly HOST: string;
  private readonly INTERVAL: number;

  /** 次数 */
  private times: Times;

  constructor(option: Option = {
    maxError: 3,
    maxRestart: 3,
    host: '192.168.0.1',
    interval: 10
  }) {
    this.MAXERROR = option.maxError || 3;
    this.MAXRESTART = option.maxRestart || 3;
    this.HOST = option.host || '192.168.0.1';
    this.INTERVAL = option.interval || 10;
    this.times = {
      total: 0,
      error: 0,
      restart: 0
    };
  }

  private async handle(data: string) {

    // total++
    this.times.total++;

    /** First char of data, may be '6', 'P' or 'F'. */
    const key = data[0];

    // host reply error
    if (key !== '6' && key !== 'P') {

      // log this warn
      logger.warn(`host reply error for the ${++this.times.error} times`);

      // max error & restart networking service
      if (this.times.error > this.MAXERROR && this.times.restart < this.MAXRESTART) {
        // reset error times
        this.times.error = 0;
        // log this warn
        logger.warn(`restart networking service for the ${++this.times.restart} times`);
        logger.debug('restarting network service...\n');
        exec('sudo systemctl restart networking');
      } else if (this.times.error > this.MAXERROR) { // restart times > max restart limit
        logger.error('Not able to restart service, try to solve it with yourself.');
        setTimeout(() => process.exit(1), 1000);
      }

    } else { // reset error times
      this.times.error = 0;
    }
    if (!(this.times.total % 60)) { // log the network state every 60 times
      const infos = await networkInterfaces();
      infos.forEach(
        (info, index) =>
          logger.info(`network interfaces report, ${index + 1} in ${infos.length}
            iface: ${info.ifaceName}
            IPv4: ${info.ip4}
            IPv6: ${info.ip6}
            Internal: ${info.internal}
            Virtual: ${info.virtual}
            State: ${info.operstate}
            Type: ${info.type}`)
      );
      logger.info('network interfaces report over');
    }

  }

  run() {
    logger.info('network monitor starting');
    const ping = exec(`ping -i ${this.INTERVAL} ${this.HOST}`).stdout;
    ping?.on('data', data => this.handle(data));
    ping?.on('error', error => logger.error('exec error:', error));
    logger.info('network monitor started');
  }

}
