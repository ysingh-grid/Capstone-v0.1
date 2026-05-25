// starter.forge.js — Default part until the AI assistant generates one.
// Edit parameters with the sliders or ask the AI assistant (🤖 bottom-right).

const width  = Param.number("Width",  60, { min: 10, max: 300, unit: "mm" });
const depth  = Param.number("Depth",  40, { min: 10, max: 300, unit: "mm" });
const height = Param.number("Height", 10, { min:  2, max: 100, unit: "mm" });

return {
  "starter plate": box(width, depth, height).color("#6366f1"),
};
