export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  appName: process.env.APP_NAME || 'devops-challenge-app',
  appVersion: process.env.APP_VERSION || '1.0.0',
  gitCommit: process.env.GIT_COMMIT || undefined
};
