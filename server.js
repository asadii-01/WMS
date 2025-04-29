const express = require("express");
const next = require("next");

// Import routes
const userRoute = require("./backend/userRoute");
const roleRoute = require("./backend/roleRoute");
const permissionRoute = require("./backend/permissionRoute");
const wastebinRoute = require("./backend/wastebinRoute");
const requestsRoute = require("./backend/requestsRoute");
const scheduleRoute = require("./backend/scheduleRoute");
const collectionRoute = require("./backend/collectionRoute");
const garbageTruckRoute = require("./backend/garbageTruckRoute");
const routeRoute = require("./backend/routeRoute");
const activityLogRoute = require("./backend/activityLogRoute");
const rolePermissionRoute = require("./backend/RolePermissionRoute");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app
  .prepare()
  .then(() => {
    const server = express();

    // Middleware
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    // Enable CORS
    server.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      if (req.method === "OPTIONS") {
        res.header(
          "Access-Control-Allow-Methods",
          "PUT, POST, PATCH, DELETE, GET"
        );
        return res.status(200).json({});
      }
      next();
    });

    // API routes
    server.use("/api/users", userRoute);
    server.use("/api/role/permission", rolePermissionRoute);
    server.use("/api/role", roleRoute);
    server.use("/api/permission", permissionRoute);
    server.use("/api/wastebin", wastebinRoute);
    server.use("/api/requests", requestsRoute);
    server.use("/api/schedule", scheduleRoute);
    server.use("/api/collection", collectionRoute);
    server.use("/api/garbageTruck", garbageTruckRoute);
    server.use("/api/route", routeRoute);
    server.use("/api/activityLog", activityLogRoute);

    // Next.js handles all other routes
    // server.all("*", (req, res) => {
    //   return handle(req, res);
    // });

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
