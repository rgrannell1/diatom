class Vault {
  dpath: string;

  constructor(dpath: string) {
    this.dpath = dpath;
  }

  async *files() {
  }
}

class Note {
  fpath: string;
  dpath: string;
  content?: string;

  constructor(dpath: string, fpath: string) {
    this.fpath = fpath;
    this.dpath = dpath;
  }

  async init() {
    this.content = await Deno.readTextFile(this.fpath);
  }

  hash(): string {
    return "";
  }

  *entities() {
  }
}

class Frontmatter {
  fpath: string;
  dpath: string;
  content: string;

  constructor(dpath: string, fpath: string, content: string) {
    this.fpath = fpath;
    this.dpath = dpath;
    this.content = content;
  }

  *entities() {
  }
}

class MarkdownBody {
  fpath: string;
  dpath: string;
  content: string;

  constructor(dpath: string, fpath: string, content: string) {
    this.fpath = fpath;
    this.dpath = dpath;
    this.content = content;
  }

  *entities() {
  }
}

export function main() {
}
