// test/math.test.ts
import { SlCanvasStage } from "../core/sl-canvas"
import { JSDOM } from "jsdom";
describe("Math utilities", () => {

  test("SlCanvasStage Init", () => {
    document.body.innerHTML = /*html*/`<div id="sl-canvas-stage" style="width: 300px; height: 300px;"></div>`;
    const stageDom = document.querySelector("#sl-canvas-stage")! as any
    const stage = new SlCanvasStage(stageDom);
    expect(stage).toBeTruthy();
  });
});