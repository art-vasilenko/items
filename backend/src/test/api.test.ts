import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { createApp } from "../app/app";
import { resetTestState } from "./test-helpers";

const app = createApp();

beforeEach(() => {
  resetTestState();
});

test("GET /api/v1/health returns service status", async () => {
  const response = await request(app)
    .get("/api/v1/health")
    .expect(200);

  assert.equal(response.body.data.status, "ok");
  assert.equal(typeof response.body.data.timestamp, "string");
});

test("GET /api/v1/items/available returns first page with cursor", async () => {
  const response = await request(app)
    .get("/api/v1/items/available?limit=3")
    .expect(200);

  assert.deepEqual(response.body.data.map((item: { id: number }) => item.id), [1, 2, 3]);
  assert.equal(response.body.meta.limit, 3);
  assert.equal(response.body.meta.hasMore, true);
  assert.equal(typeof response.body.meta.nextCursor, "string");
});

test("GET /api/v1/items/available supports cursor-based pagination", async () => {
  const firstPage = await request(app)
    .get("/api/v1/items/available?limit=2")
    .expect(200);

  const secondPage = await request(app)
    .get("/api/v1/items/available")
    .query({
      limit: 2,
      cursor: firstPage.body.meta.nextCursor,
    })
    .expect(200);

  assert.deepEqual(secondPage.body.data.map((item: { id: number }) => item.id), [3, 4]);
});

test("GET /api/v1/items/available supports filtering", async () => {
  const response = await request(app)
    .get("/api/v1/items/available")
    .query({
      limit: 5,
      query: "12",
    })
    .expect(200);

  assert.deepEqual(response.body.data.map((item: { id: number }) => item.id), [12, 112, 120, 121, 122]);
});

test("POST /api/v1/items/custom adds user-defined IDs and exposes them in filtered results", async () => {
  await request(app)
    .post("/api/v1/items/custom")
    .send({ ids: [1_000_001, 1_000_100] })
    .expect(200);

  const response = await request(app)
    .get("/api/v1/items/available")
    .query({
      limit: 10,
      query: "1000001",
    })
    .expect(200);

  assert.deepEqual(response.body.data.map((item: { id: number }) => item.id), [1_000_001]);
});

test("POST /api/v1/items/custom skips duplicate IDs and adds unique ones", async () => {
  const response = await request(app)
    .post("/api/v1/items/custom")
    .send({ ids: [1, 1_000_010] })
    .expect(200);

  assert.deepEqual(response.body.data.addedIds, [1_000_010]);
  assert.deepEqual(response.body.data.skippedDuplicates, [1]);
  assert.equal(response.body.data.count, 1);
});

test("POST /api/v1/selection/select moves items into selected list", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [3, 1, 2] })
    .expect(200);

  const selectedResponse = await request(app)
    .get("/api/v1/items/selected?limit=10")
    .expect(200);

  assert.deepEqual(selectedResponse.body.data.map((item: { id: number }) => item.id), [3, 1, 2]);

  const availableResponse = await request(app)
    .get("/api/v1/items/available?limit=5")
    .expect(200);

  assert.deepEqual(availableResponse.body.data.map((item: { id: number }) => item.id), [4, 5, 6, 7, 8]);
});

test("POST /api/v1/selection/select rejects unknown IDs", async () => {
  const response = await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [2_000_000] })
    .expect(400);

  assert.equal(response.body.error.message, "Cannot select unknown IDs");
});

test("POST /api/v1/selection/unselect removes item from selected list", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [1, 2, 3] })
    .expect(200);

  await request(app)
    .post("/api/v1/selection/unselect")
    .send({ ids: [2] })
    .expect(200);

  const selectedResponse = await request(app)
    .get("/api/v1/items/selected?limit=10")
    .expect(200);

  assert.deepEqual(selectedResponse.body.data.map((item: { id: number }) => item.id), [1, 3]);
});

test("POST /api/v1/selection/reorder changes order of selected items", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [1, 2, 3] })
    .expect(200);

  await request(app)
    .post("/api/v1/selection/reorder")
    .send({ activeId: 3, overId: 1 })
    .expect(200);

  const selectedResponse = await request(app)
    .get("/api/v1/items/selected?limit=10")
    .expect(200);

  assert.deepEqual(selectedResponse.body.data.map((item: { id: number }) => item.id), [3, 1, 2]);
});

test("POST /api/v1/selection/reorder rejects incomplete payload", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [1, 2, 3] })
    .expect(200);

  const response = await request(app)
    .post("/api/v1/selection/reorder")
    .send({ activeId: 3 })
    .expect(400);

  assert.equal(response.body.error.message, "Validation failed");
});

test("POST /api/v1/selection/reorder rejects IDs that are not selected", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [1, 2, 3] })
    .expect(200);

  const response = await request(app)
    .post("/api/v1/selection/reorder")
    .send({ activeId: 3, overId: 999 })
    .expect(400);

  assert.equal(response.body.error.message, "Reorder payload contains IDs that are not selected");
  assert.deepEqual(response.body.error.details.invalidIds, [999]);
});

test("GET /api/v1/items/selected supports filtering and cursor pagination", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [12, 112, 120, 121, 122] })
    .expect(200);

  const firstPage = await request(app)
    .get("/api/v1/items/selected")
    .query({
      limit: 2,
      query: "12",
    })
    .expect(200);

  assert.deepEqual(firstPage.body.data.map((item: { id: number }) => item.id), [12, 112]);

  const secondPage = await request(app)
    .get("/api/v1/items/selected")
    .query({
      limit: 2,
      query: "12",
      cursor: firstPage.body.meta.nextCursor,
    })
    .expect(200);

  assert.deepEqual(secondPage.body.data.map((item: { id: number }) => item.id), [120, 121]);
});

test("POST /api/v1/batch/flush processes deduplicated operations", async () => {
  const response = await request(app)
    .post("/api/v1/batch/flush")
    .send({
      commands: [
        { type: "add-items", ids: [1_000_005, 1_000_005] },
        { type: "select-items", ids: [5, 6] },
        { type: "unselect-items", ids: [5] },
      ],
    })
    .expect(200);

  assert.equal(response.body.data.processed, true);
  assert.equal(response.body.data.addItemsCount, 1);

  const selectedResponse = await request(app)
    .get("/api/v1/items/selected?limit=10")
    .expect(200);

  assert.deepEqual(selectedResponse.body.data.map((item: { id: number }) => item.id), [6]);
});

test("POST /api/v1/batch/flush supports operation-based reorder command", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [1, 2, 3] })
    .expect(200);

  const response = await request(app)
    .post("/api/v1/batch/flush")
    .send({
      commands: [
        { type: "reorder-selected", activeId: 3, overId: 1 },
      ],
    })
    .expect(200);

  assert.equal(response.body.data.processed, true);
  assert.equal(response.body.data.reordered, true);

  const selectedResponse = await request(app)
    .get("/api/v1/items/selected?limit=10")
    .expect(200);

  assert.deepEqual(selectedResponse.body.data.map((item: { id: number }) => item.id), [3, 1, 2]);
});

test("POST /api/v1/batch/flush applies selection changes before reorder in the same batch", async () => {
  await request(app)
    .post("/api/v1/selection/select")
    .send({ ids: [1, 2, 3, 4] })
    .expect(200);

  await request(app)
    .post("/api/v1/batch/flush")
    .send({
      commands: [
        { type: "unselect-items", ids: [2] },
        { type: "reorder-selected", orderedIds: [4, 1, 3] },
      ],
    })
    .expect(200);

  const selectedResponse = await request(app)
    .get("/api/v1/items/selected?limit=10")
    .expect(200);

  assert.deepEqual(selectedResponse.body.data.map((item: { id: number }) => item.id), [4, 1, 3]);
});

test("GET /api-docs.yaml returns OpenAPI schema", async () => {
  const response = await request(app)
    .get("/api-docs.yaml")
    .expect(200);

  assert.match(response.text, /openapi:\s+3\.1\.0/);
  assert.match(response.text, /\/api\/v1\/items\/available:/);
});

test("GET /api-docs returns Swagger UI HTML", async () => {
  const response = await request(app)
    .get("/api-docs")
    .expect(301);

  assert.match(String(response.headers.location), /\/api-docs\/$/);
});

test("GET /api/v1/items/available validates limit", async () => {
  const response = await request(app)
    .get("/api/v1/items/available?limit=1000")
    .expect(400);

  assert.equal(response.body.error.message, "Validation failed");
});

test("POST /api/v1/items/custom handles malformed JSON", async () => {
  const response = await request(app)
    .post("/api/v1/items/custom")
    .set("Content-Type", "application/json")
    .send("{")
    .expect(400);

  assert.equal(response.body.error.message, "Malformed JSON request body");
});

test("Unknown route returns normalized 404 response", async () => {
  const response = await request(app)
    .get("/api/v1/unknown")
    .expect(404);

  assert.equal(response.body.error.message, "Route not found");
});
