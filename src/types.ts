export type Rewrite = {
  name: string;
  description: string;
  rewrite(content: string): string;
};

export type Reporter = "json" | "verbose";
