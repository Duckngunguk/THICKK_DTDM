const { PrismaClient } = require('@prisma/client');
(async ()=>{
  const p = new PrismaClient();
  console.log(Object.keys(p));
  await p.$disconnect();
})();
