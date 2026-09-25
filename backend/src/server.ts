import dotenv from "dotenv";

dotenv.config();

console.log(
  "JWT SECRET EXISTS:",
  !!process.env.JWT_SECRET
);

import http from "http";
import path from "path";

import app from "./app";
import pool from "./config/database";

import userProfileRoutes from "./routes/userProfileRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import callRoutes from "./routes/callRoutes";
import profileRoutes from "./routes/profileRoutes";

import {
  initializeChatSocket,
} from "./chatSocket";

const PORT =
  Number(process.env.PORT) || 5000;

/*
|--------------------------------------------------------------------------
| Static uploads
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  require("express").static(
    path.join(
      process.cwd(),
      "public",
      "uploads"
    )
  )
);

/*
|--------------------------------------------------------------------------
| Profile routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/profile",
  userProfileRoutes
);

/*
|--------------------------------------------------------------------------
| User routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/users",
  userRoutes
);


app.use(
  "/api/calls",
  callRoutes
);
/*
|--------------------------------------------------------------------------
| Chat routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/chat",
  chatRoutes
);


app.use("/api/profile", profileRoutes);
/*
|--------------------------------------------------------------------------
| Create HTTP server
|--------------------------------------------------------------------------
*/

const server =
  http.createServer(app);

/*
|--------------------------------------------------------------------------
| Initialize WebSocket chat
|--------------------------------------------------------------------------
*/

initializeChatSocket(
  server
);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

const startServer =
  async () => {
    try {
      const connection =
        await pool.getConnection();

      console.log(
        "✅ MySQL connected successfully"
      );

      connection.release();

      server.listen(
        PORT,
        "0.0.0.0",
        () => {
          console.log(
            `🚀 LUMORA API running on port ${PORT}`
          );

          console.log(
            `🌐 http://192.168.1.4:${PORT}`
          );

          console.log(
            `🌐 http://localhost:${PORT}`
          );

          console.log(
            `💬 WebSocket: ws://192.168.1.4:${PORT}/chat`
          );
        }
      );
    } catch (error) {
      console.error(
        "❌ Server startup failed:",
        error
      );

      process.exit(1);
    }
  };

startServer();
