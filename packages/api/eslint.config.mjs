import tseslint from "typescript-eslint";

export default tseslint.config(tseslint.configs.recommended, {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["react-dom", "react-dom/*", "next", "next/*"],
            message: "api는 React DOM·Next.js import 금지 - 앱에서도 사용",
          },
        ],
      },
    ],
  },
});
