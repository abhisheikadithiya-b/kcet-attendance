const app = require('./api/index');
const PORT = process.env.PORT || 3000;

// Start server only if run directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`  Smart Campus Attendance Server Running At:                 `);
    console.log(`  http://localhost:${PORT}                                    `);
    console.log(`                                                             `);
    console.log(`  - Local High-Accuracy SSD Mobilenet v1 detector active.    `);
    console.log(`  - Edit .env file to enable Azure Face / Hugging Face.      `);
    console.log(`=============================================================`);
  });
}

// Export for Vercel serverless compiler
module.exports = app;
