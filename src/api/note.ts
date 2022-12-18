export class Note {
  content: string;

  constructor(content: string) {
    this.content = content;
  }
  frontmatter(): NoteFrontMatter {
    return new NoteFrontMatter("");
  }
  body(): NoteBody {
    return new NoteBody("");
  }
  hash(): string {
    return "";
  }
}

export class NoteFrontMatter {
  content: string;

  constructor(content: string) {
    this.content = content;
  }
  toYaml(): string {
    return "";
  }
  fromYaml(): string {
    return "";
  }
}

export class NoteBody {
  content: string;

  constructor(content: string) {
    this.content = content;
  }
}
