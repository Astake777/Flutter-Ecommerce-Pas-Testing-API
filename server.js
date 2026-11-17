import { createServer } from 'node:http';
import handler from './api/index.js';

const port = process.env.PORT || 3000;
createServer(handler).listen(port, () => console.log(`http://localhost:${port}/api/products`));
