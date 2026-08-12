import app from './app';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mini ERP + CRM Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`📡 Health Check: /health or /api/health`);
});
