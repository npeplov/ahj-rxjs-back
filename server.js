const http = require('http');
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const uuid = require('uuid');
const app = new Koa();
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');


const public = path.join(__dirname, '/public')
app.use(koaStatic(public));

// cors
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const Router = require('koa-router');
const router = new Router();

const emails = {
  "status": "ok",
  "timestamp": 1553400000,
  "messages": [
    {
      "id": "<uuid>",
      "from": "anya@ivanova",
      "subject": "Hello from Anya",
      "body": "Long message body here" ,
      "received": 1553108200
    },
    {
      "id": "<uuid>",
      "from": "alex@petrov",
      "subject": "Hello from Alex Petrov!",
      "body": "Long message body here",
      "received": 1553107200
    },
  ]
}

function newMail() {
  return {
    id: uuidv4(),
    from: faker.internet.email(),
    subject: `Hello from ${faker.name.findName()}`,
    body: faker.lorem.paragraph(),
    received: new Date(),
  }
}


router
  .post('/api/check-email', async (ctx, next) => {
    emails.messages.push(newMail());
    console.log(ctx.request.method);
    ctx.response.body = emails;
  })
  .get('/api/check-email', async (ctx, next) => {
  //   console.log(ctx.request.method);
  //   ctx.response.body = emails;
  // {
    // available: email.includes('@') && !email.startsWith('admin')
  // }
  });

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);

