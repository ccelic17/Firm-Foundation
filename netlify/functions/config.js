exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
  body: JSON.stringify({
    oneSignalAppId: process.env.ONESIGNAL_APP_ID || '',
  }),
});
