import { Logger } from '@iinfinity/logger';

export const logger = new Logger({
  name: 'system',
  stdout: process.stdout,
  stderr: process.stderr,
  fileout: 'network.log',
  fileerr: 'network.log'
});
