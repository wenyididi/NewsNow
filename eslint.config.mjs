import { ourongxing, react } from "@ourongxing/eslint-config"

export default ourongxing({
  type: "app",
  ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "**/*.json"],
}).append(react({
  files: ["src/**"],
})).overrideRules({
  "react-dom/no-children-in-void-dom-elements": "off",
  "react/ensure-forward-ref-using-ref": "off",
  "react/no-comment-textnodes": "off",
  "react/no-nested-components": "off",
  "react/prefer-shorthand-boolean": "off",
  "react/prefer-shorthand-fragment": "off",
  "react/no-implicit-key": "off",
})
