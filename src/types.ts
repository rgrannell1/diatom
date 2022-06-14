export type Rewrite = {
  name: string;
  description: string;
  rewrite(content: string): string;
};
