import request from "supertest";
import express from "express";
import router from "../src/apis/routes/simulation"; // adjust path
import SimulationEngine from "../src/apis/services/SimulationEngine";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe,beforeEach,test, expect, jest, beforeAll, afterAll } from "@jest/globals";

jest.mock("../src/apis/services/SimulationEngine");

let app,server;

describe("Simulation Routes", () => {
  let simEngineMock: jest.Mocked<SimulationEngine>;

  beforeAll((done) => {
    app = express();
    app.use(express.json());
    app.use("/simulation", router);

    // Start server
    server = app.listen(0, done); // port 0 = random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    simEngineMock = {
      getSnapshot: jest.fn().mockReturnValue({ data: "snapshot" }),
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
      updateConfig: jest.fn(),
    } as any;

    (SimulationEngine.getInstance as jest.Mock).mockReturnValue(simEngineMock);
  });

  test("GET /simulation/snapshot", async () => {
    const res = await request(app).get("/simulation/snapshot");
    console.log("res",res)
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: "snapshot" });
    expect(simEngineMock.getSnapshot).toHaveBeenCalled();
  });

  test("POST /simulation/start", async () => {
    const res = await request(app).post("/simulation/start");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "started" });
    expect(simEngineMock.start).toHaveBeenCalled();
  });

  test("POST /simulation/stop", async () => {
    const res = await request(app).post("/simulation/stop");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "stopped" });
    expect(simEngineMock.stop).toHaveBeenCalled();
  });

  test("POST /simulation/reset", async () => {
    const res = await request(app).post("/simulation/reset");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "reset" });
    expect(simEngineMock.reset).toHaveBeenCalled();
  });

  test("POST /simulation/config - valid body", async () => {
    const res = await request(app)
      .post("/simulation/config")
      .send({ key: "simulationSpeed", value: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "config updated",
      key: "simulationSpeed",
      value: 2,
    });
    expect(simEngineMock.updateConfig).toHaveBeenCalledWith("simulationSpeed", 2);
  });

  test("POST /simulation/config - invalid body", async () => {
    const res = await request(app).post("/simulation/config").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid request body" });
  });
});
