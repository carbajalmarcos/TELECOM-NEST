print('Start creating database ##########################');
db = db.getSiblingDB('telecom-message');
db.createUser({
  user: 'username',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'telecom-message' }],
});

db = db.getSiblingDB('telecom-numbers');
db.createUser({
  user: 'username',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'telecom-numbers' }],
});

db = db.getSiblingDB('telecom-historic');
db.createUser({
  user: 'username',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'telecom-historic' }],
});
print('End creating database ##########################');
