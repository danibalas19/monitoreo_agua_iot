import morgan from 'morgan';

const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

export const morganMiddleware = morgan(morganFormat, {
  skip: (req, res) => res.statusCode < 400
});

export const logger = {
  info: (message, data = '') => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data),
  error: (message, error = '') => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error),
  warn: (message, data = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data),
  debug: (message, data = '') => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }
};
