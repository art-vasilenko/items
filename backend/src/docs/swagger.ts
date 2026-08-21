import type { Express, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";

const resolveOpenApiYamlPath = () => {
  const candidates = [
    path.resolve(__dirname, "openapi.yaml"),
    path.resolve(process.cwd(), "src", "docs", "openapi.yaml"),
    path.resolve(process.cwd(), "dist", "docs", "openapi.yaml"),
  ];

  const matchedPath = candidates.find((candidate) => fs.existsSync(candidate));

  if (!matchedPath) {
    throw new Error("OpenAPI YAML file was not found");
  }

  return matchedPath;
};

export const registerSwagger = (app: Express) => {
  app.get("/api-docs.yaml", (_request: Request, response: Response) => {
    response.sendFile(resolveOpenApiYamlPath());
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        url: "/api-docs.yaml",
        persistAuthorization: false,
      },
    }),
  );
};
