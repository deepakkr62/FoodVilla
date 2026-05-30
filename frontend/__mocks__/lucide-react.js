// Lucide ships ESM only; stub icons as inert SVGs for Jest.
const React = require("react");

function makeIcon(name) {
  const Component = (props) =>
    React.createElement("svg", { "data-icon": name, ...props });
  Component.displayName = name;
  return Component;
}

module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === "__esModule") return true;
      if (typeof prop === "string") return makeIcon(prop);
      return undefined;
    },
  },
);
