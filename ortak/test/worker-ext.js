importScripts('../../classes/worker/worker.js');
self.selfRoot = `${webRoot}/ortak/test`; importScripts(`${selfRoot}/testBase.js`);
const testLibs = [`${webRoot}/app/ticari/test/tests.js`, `${webRoot}/app/parkBulurum/test/tests.js`]; importScripts(...testLibs);
self.runnableClass = TestBase
