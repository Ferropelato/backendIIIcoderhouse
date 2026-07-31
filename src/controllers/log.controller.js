const logger = require('../logger');
const catchAsync = require('../utils/catchAsync');

class LogController {
  testLevels = catchAsync((req, res) => {
    logger.debug('Log de prueba: nivel debug');
    logger.http('Log de prueba: nivel http');
    logger.info('Log de prueba: nivel info');
    logger.warning('Log de prueba: nivel warning');
    logger.error('Log de prueba: nivel error');
    logger.fatal('Log de prueba: nivel fatal');

    res.status(200).json({
      status: 'success',
      message: 'Se generaron logs de prueba en todos los niveles configurados',
      payload: { levels: ['debug', 'http', 'info', 'warning', 'error', 'fatal'] },
    });
  });
}

module.exports = new LogController();
