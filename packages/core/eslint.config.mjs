import tseslint from "typescript-eslint";

export default tseslint.config(tseslint.configs.recommended, {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "react",
              "react-*",
              "react/*",
              "next",
              "next/*",
              "three",
              "three/*",
              "@react-three/*",
            ],
            message: "core는 React·Next.js·three.js import 금지",
          },
        ],
      },
    ],
  },
});
