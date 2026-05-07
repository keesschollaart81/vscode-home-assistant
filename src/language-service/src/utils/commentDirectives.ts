import { TextDocument } from "vscode-languageserver-protocol";

const DIRECTIVE_PREFIX = "homeassistant:";
const DIRECTIVE_NAME_REGEX = /homeassistant:([a-zA-Z][a-zA-Z-]*)/g;

export interface IgnoreDirectives {
  ignoredIds: Set<string>;
  disabledLines: Set<number>;
}

interface ParsedDirective {
  name: string;
  args: string[];
}

export function parseIgnoreDirectives(
  document: TextDocument,
): IgnoreDirectives {
  const ignoredIds = new Set<string>();
  const disabledLines = new Set<number>();

  const lines = document.getText().split("\n");
  let rangeDisabled = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const hashIndex = line.indexOf("#");

    if (hashIndex === -1) {
      if (rangeDisabled) {
        disabledLines.add(lineIndex);
      }
      continue;
    }

    const commentText = line.slice(hashIndex + 1);
    const directives = findDirectives(commentText);

    let lineIsDisabled = rangeDisabled;

    for (const directive of directives) {
      switch (directive.name) {
        case "ignore":
          for (const id of directive.args) {
            ignoredIds.add(id);
          }
          break;
        case "disable-line":
          lineIsDisabled = true;
          break;
        case "disable-next-line":
          if (lineIndex + 1 < lines.length) {
            disabledLines.add(lineIndex + 1);
          }
          break;
        case "disable":
          rangeDisabled = true;
          lineIsDisabled = true;
          break;
        case "enable":
          rangeDisabled = false;
          lineIsDisabled = false;
          break;
      }
    }

    if (lineIsDisabled) {
      disabledLines.add(lineIndex);
    }
  }

  return { ignoredIds, disabledLines };
}

function findDirectives(commentText: string): ParsedDirective[] {
  const matches: { name: string; nameEnd: number }[] = [];
  DIRECTIVE_NAME_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = DIRECTIVE_NAME_REGEX.exec(commentText)) !== null) {
    matches.push({
      name: match[1],
      nameEnd: match.index + match[0].length,
    });
  }

  const results: ParsedDirective[] = [];
  for (let i = 0; i < matches.length; i++) {
    const next = matches[i + 1];
    const argsStart = matches[i].nameEnd;
    const argsEnd = next
      ? commentText.lastIndexOf(DIRECTIVE_PREFIX, next.nameEnd)
      : commentText.length;
    const argsText = commentText.slice(argsStart, argsEnd);
    const args = argsText
      .split(/[\s,]+/)
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
    results.push({ name: matches[i].name, args });
  }

  return results;
}
