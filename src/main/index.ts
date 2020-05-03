import { Logger } from '@iinfinity/logger';
import { exec } from 'child_process';
import { networkInterfaces } from 'systeminformation';

export interface Times {
  total: number;
  error: number;
  restart: number;
}

export class NetworkMonitor {

  /** Logger */
  private logger: Logger;
  /** 次数 */
  private times: Times;

  constructor(
    private readonly MAXERROR: number = 3,
    private readonly MAXRESTART: number = 3,
    private readonly HOST: string = '192.168.0.1',
    private readonly INTERVAL: number = 10
  ) {
    this.logger = new Logger({
      name: 'system',
      stdout: process.stdout,
      stderr: process.stderr,
      fileout: 'network.log',
      fileerr: 'network.log'
    });
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
      this.logger.warn(`host reply error for the ${++this.times.error} times`);

      // max error & restart networking service
      if (this.times.error > this.MAXERROR && this.times.restart < this.MAXRESTART) {
        // reset error times
        this.times.error = 0;
        // log this warn
        this.logger.warn(`restart networking service for the ${++this.times.restart} times`);
        this.logger.debug('restarting network service...\n');
        exec('sudo systemctl restart networking');
      } else if (this.times.error > this.MAXERROR) { // restart times > max restart limit
        this.logger.error('Not able to restart service, try to solve it with yourself.');
        setTimeout(() => process.exit(1), 1000);
      }

    } else { // reset error times
      this.times.error = 0;
    }
    if (!(this.times.total % 60)) { // log the network state every 60 times
      const infos = await networkInterfaces();
      infos.forEach(
        (info, index) =>
          this.logger.info(`network interfaces report, ${index + 1} in ${infos.length}
            iface: ${info.ifaceName}
            IPv4: ${info.ip4}
            IPv6: ${info.ip6}
            Internal: ${info.internal}
            Virtual: ${info.virtual}
            State: ${info.operstate}
            Type: ${info.type}`)
      );
      this.logger.info('network interfaces report over');
    }

  }

  run() {
    this.logger.info('network monitor starting');
    const ping = exec(`ping -i ${this.INTERVAL} ${this.HOST}`).stdout;
    ping?.on('data', data => this.handle(data));
    ping?.on('error', error => this.logger.error('exec error:', error));
    this.logger.info('network monitor started');
  }

}

new NetworkMonitor(3, 3, '192.168.0.2', 1).run();
