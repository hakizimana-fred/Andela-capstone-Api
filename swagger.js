const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Capstone Blog API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
    swagger: "3.0",
  },
  apis: ["./routes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

module.exports = swaggerDocs;
