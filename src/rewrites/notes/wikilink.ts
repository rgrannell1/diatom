type WikilinkData = {
  title: string;
  label?: string;
  suffix?: string;
};

export class Wikilink {
  static from(text: string): WikilinkData {
    const labelledWikilink =
      /\[{2}(?<title>.+)\|(?<label>.+)\]{2}(?<suffix>\S*)/;
    const unlabelledWikilink = /\[{2}(?<title>.+)\]{2}(?<suffix>\S*)/;

    const labelledMatches = text.match(labelledWikilink);
    if (labelledMatches) {
      return labelledMatches.groups as WikilinkData;
    }

    const unlabelledMatches = text.match(unlabelledWikilink);
    if (unlabelledMatches) {
      return unlabelledMatches.groups as WikilinkData;
    }

    throw new TypeError(`did not match text as wikilink\n${text}`);
  }
  static to(data: WikilinkData) {
    let text = "[[";

    if (data.title) {
      text += data.title;
    }

    if (data.label) {
      text += `|${data.label}]]`;
    } else {
      text += "]]";
    }

    if (data.suffix) {
      text += data.suffix;
    }

    return text;
  }
}
