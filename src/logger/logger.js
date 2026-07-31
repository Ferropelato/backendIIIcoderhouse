require('dotenv').config();
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const LEVELS = { fatal: 0, error: 1, warning: 2, info: 3, http: 4, debug: 5 };
const COLORS = { fatal: 'redBG white bold', error: 'red', warning: 'yellow', info: 'green', http: 'magenta', debug: 'blue' };
winston.addColors(COLORS);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const consoleLevel = isProduction ? 'info' : 'debug';

const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat()
);

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]\t${message}`)
);

const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]\t${message}`)
);

const logger = winston.createLogger({
  levels: LEVELS,
  level: consoleLevel,
  transports: [
    new winston.transports.Console({
      level: consoleLevel,
      format: consoleFormat,
    }),
    new winston.transports.DailyRotateFile({
      level: consoleLevel,
      dirname: LOGS_DIR,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: LOGS_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    }),
  ],
});

module.exports = logger;
