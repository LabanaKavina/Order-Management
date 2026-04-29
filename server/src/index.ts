import app from "./app";

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT ?? 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
