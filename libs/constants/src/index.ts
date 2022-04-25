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

// TODO: check if 120 days is okey
export const utils = {
  QUARANTINE_NUMBERS_DAYS: 120,
  POOL_NUMBERS_QUANTITY: 4,
  OLD_DAY_HISTORIC: 120,
};
