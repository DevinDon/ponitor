import { Logger } from '@iinfinity/logger';

export const logger = new Logger({
  name: 'system',
  stdout: process.stdout,
  stderr: process.stderr,
  fileout: 'ponitor.log',
  fileerr: 'ponitor.log'
});
