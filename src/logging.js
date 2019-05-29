const winston = require('winston')
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    colorize: true,
    defaultMeta: { service: 'value-mesh' },
    transports: [
        new winston.transports.Console()
    ]
})

module.exports = logger