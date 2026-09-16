import dotenv from "dotenv";

dotenv.config();
console.log(
  "JWT SECRET EXISTS:",
  !!process.env.JWT_SECRET
);
import app from "./app";
import pool from "./config/database";
import path from "path";
import userProfileRoutes from "./routes/userProfileRoutes";

const PORT = Number(process.env.PORT) || 5000;

app.use(
  "/uploads",
  require("express").static(
    path.join(process.cwd(), "public", "uploads")
  )
);

// Profile routes
app.use("/api/profile", userProfileRoutes);

const startServer = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("✅ MySQL connected successfully");

    connection.release();

    app.listen(PORT, () => {
      console.log(
        `🚀 LUMORA API running on port ${PORT}`
      );

      console.log(
        `🌐 http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error
    );

    process.exit(1);
  }
};

startServer();