import { Logger } from '@iinfinity/logger';
import { existsSync, mkdirSync } from 'fs';

export const LOG_DIR = '/home/admin/service/ponitor/log';

export const logger = new Logger({
  name: 'pointor',
  stdout: process.stdout,
  stderr: process.stderr,
  fileout: `${LOG_DIR}/ponitor.log`,
  fileerr: `${LOG_DIR}/ponitor.log`
});

export function checkLogDir() {
  existsSync(`${LOG_DIR}`) || mkdirSync(`${LOG_DIR}`);
}
