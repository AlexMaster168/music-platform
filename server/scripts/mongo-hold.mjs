// Держит in-memory MongoDB живым на фиксированном порту (для локального демо без Atlas).
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create({
   instance: { port: 27027, dbName: 'music' },
});
console.log('MONGO_READY ' + mongod.getUri());

process.on('SIGTERM', async () => {
   await mongod.stop();
   process.exit(0);
});
setInterval(() => {}, 1 << 30);
