/**
 * HUMMBL REST API Server
 * Hono.js-based REST API for mental models access
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Context, Next } from "hono";
import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import {
  TRANSFORMATIONS,
  PROBLEM_PATTERNS,
  getAllModels,
  getModelByCode,
  getTransformationByKey,
  searchModels,
  getModelsByTransformation,
} from "./framework/base120.js";
import { isOk } from "./types/domain.js";
import { createD1Client } from "./storage/d1-client.js";
import type { TransformationType } from "./types/domain.js";

type Bindings = {
  DB: D1Database;
  API_KEYS: KVNamespace;
  SESSIONS: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Authentication middleware
async function authenticate(
  c: Context<{ Bindings: Bindings }>,
  next: Next
): Promise<Response | void> {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer "

  // TODO: Implement API key validation against KV store
  // For now, accept any key that starts with "hummbl_"
  if (!apiKey.startsWith("hummbl_")) {
    return c.json({ error: "Invalid API key format" }, 401);
  }

  await next();
}

// Health check
app.get("/health", (c: Context<{ Bindings: Bindings }>) => {
  return c.json({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    models_count: 120,
  });
});

// Get specific model by code
app.get("/v1/models/:code", authenticate, async (c: Context<{ Bindings: Bindings }>) => {
  const code = c.req.param("code").toUpperCase();

  const result = getModelByCode(code);
  if (!isOk(result)) {
    return c.json({ error: "Model not found" }, 404);
  }

  const model = result.value;
  const transformation = Object.values(TRANSFORMATIONS).find((t) =>
    t.models.some((m) => m.code === model.code)
  );

  // Get enriched data from D1
  const db = createD1Client(c.env.DB);
  const enrichedResult = await db.getMentalModel(code);

  if (!isOk(enrichedResult)) {
    // Fall back to basic model if not in DB
    return c.json({
      code: model.code,
      name: model.name,
      definition: model.definition,
      priority: model.priority,
      transformation: transformation?.key ?? null,
    });
  }

  return c.json(enrichedResult.value);
});

// List all models with optional transformation filter
app.get("/v1/models", authenticate, async (c: Context<{ Bindings: Bindings }>) => {
  const transformationFilter = c.req.query("transformation");

  let models = getAllModels();

  if (transformationFilter) {
    const result = getModelsByTransformation(transformationFilter.toUpperCase() as TransformationType);
    if (!isOk(result)) {
      return c.json({ error: "Invalid transformation filter" }, 400);
    }
    models = result.value;
  }

  const enriched = models.map((m) => {
    const trans = Object.values(TRANSFORMATIONS).find((t) =>
      t.models.some((model) => model.code === m.code)
    );

    return {
      code: m.code,
      name: m.name,
      definition: m.definition,
      priority: m.priority,
      transformation: trans?.key ?? "UNKNOWN",
    };
  });

  return c.json({
    total: enriched.length,
    models: enriched,
  });
});

// Search models
app.get("/v1/search", authenticate, async (c: Context<{ Bindings: Bindings }>) => {
  const query = c.req.query("q");

  if (!query || query.length < 2) {
    return c.json({ error: "Query parameter 'q' must be at least 2 characters" }, 400);
  }

  const result = searchModels(query);
  if (!isOk(result)) {
    return c.json({ error: "Search failed" }, 500);
  }

  const enriched = result.value.map((m) => {
    const trans = Object.values(TRANSFORMATIONS).find((t) =>
      t.models.some((model) => model.code === m.code)
    );
    return {
      code: m.code,
      name: m.name,
      definition: m.definition,
      priority: m.priority,
      transformation: trans?.key ?? "UNKNOWN",
    };
  });

  return c.json({
    query,
    resultCount: enriched.length,
    results: enriched,
  });
});

// Get transformation details
app.get("/v1/transformations/:key", authenticate, async (c: Context<{ Bindings: Bindings }>) => {
  const key = c.req.param("key").toUpperCase() as TransformationType;

  const result = getTransformationByKey(key);
  if (!isOk(result)) {
    return c.json({ error: "Transformation not found" }, 404);
  }

  const transformation = result.value;
  return c.json({
    key: transformation.key,
    name: transformation.name,
    description: transformation.description,
    modelCount: transformation.models.length,
    models: transformation.models,
  });
});

// List all transformations
app.get("/v1/transformations", authenticate, async (c: Context<{ Bindings: Bindings }>) => {
  const transformations = Object.values(TRANSFORMATIONS).map((t) => ({
    key: t.key,
    name: t.name,
    description: t.description,
    modelCount: t.models.length,
  }));

  return c.json({
    total: transformations.length,
    transformations,
  });
});

// Get recommendations for a problem
app.post("/v1/recommend", authenticate, async (c: Context<{ Bindings: Bindings }>) => {
  const { problem } = await c.req.json();

  if (!problem || typeof problem !== "string" || problem.length < 10) {
    return c.json({ error: "Problem description must be at least 10 characters" }, 400);
  }

  const problemLower = problem.toLowerCase();

  const matchedPatterns = PROBLEM_PATTERNS.filter((p) => {
    const patternWords = p.pattern.toLowerCase().split(" ");
    return patternWords.some((word) => problemLower.includes(word));
  });

  const recommendations = matchedPatterns.length > 0 ? matchedPatterns : PROBLEM_PATTERNS;

  const enrichedRecommendations = recommendations.map((rec) => ({
    pattern: rec.pattern,
    transformations: rec.transformations.map((tKey) => {
      const t = TRANSFORMATIONS[tKey];
      return {
        key: t.key,
        name: t.name,
        description: t.description,
      };
    }),
    topModels: rec.topModels
      .map((code) => {
        const result = getModelByCode(code);
        if (!isOk(result)) {
          return null;
        }
        const model = result.value;
        return {
          code: model.code,
          name: model.name,
          definition: model.definition,
          priority: model.priority,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null),
  }));

  return c.json({
    problem,
    recommendationCount: enrichedRecommendations.length,
    recommendations: enrichedRecommendations,
  });
});

// Error handling
app.onError((err: Error, c: Context<{ Bindings: Bindings }>) => {
  console.error(`${err}`);
  return c.json({ error: "Internal server error" }, 500);
});

// 404 handler
app.notFound((c: Context<{ Bindings: Bindings }>) => {
  return c.json({ error: "Endpoint not found" }, 404);
});

export default app;
