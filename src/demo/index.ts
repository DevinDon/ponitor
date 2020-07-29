import { MemoryMonitor } from '../main';
import { logger } from '../main/logger';

try {
  new MemoryMonitor().run();
} catch (error) {
  logger.error(error);
}

// new NetworkMonitor().run();
