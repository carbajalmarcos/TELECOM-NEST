export const rmq = {
  EXCHANGE_DIRECT_NAME: 'amq.direct',
  EXCHANGE_DIRECT_TYPE: 'direct',
  EXCHANGE_DELAYED_NAME: 'delayed-spam',
  EXCHANGE_DELAYED_TYPE: 'x-delayed-message',
  NORMAL_FLOW: 'NORMAL_FLOW',
  URGENT_FLOW: 'URGENT_FLOW',
  PATTERN: 'message',
  DELAY_MILLISECONDS: '60000',
  SPAM_LIMIT: 9,
};
export const redis = {
  DB_NUMBER_LOCKER: 0,
  LOCKER_KEY: 'lockedNumbers',
  DB_LOCALHOST: 'redis-number-locker',
};
