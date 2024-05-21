const readline = require("readline");
const fs = require("fs");
const Bluebird = require("bluebird");

async function main() {
  const domainsFile = readline.createInterface({
    input: fs.createReadStream("./domains.txt"),
    crlfDelay: Infinity,
  });

  const domains = [];

  for await (const line of domainsFile) {
    domains.push(line);
  }

  domainsFile.close();

  const { got } = await import("got");

  let count = 0;

  await Bluebird.map(
    domains,
    async (domain) => {
      try {
        const client = got.extend({
          retry: {
            limit: 0,
          },
          timeout: {
            request: 1000,
          },
        });

        const res = await client.get(`https://${domain}/`);
        count++;
        console.log(count, domains.length, res.statusCode);
      } catch (error) {
        count++;
        console.log(count, domains.length, error.message);
      }
    },
    {
      concurrency: 200,
    }
  );
}

main();
