import { SnippetString } from "vscode";
import * as YAML from "yaml";

export const suggestGroupName = (entities: string[]): string => {
  const entityNames = entities
    .map((entity) => entity.split(".")[1].replace(/_/g, " "))
    .map((e) => e.split(/\s/))
    .flat();

  // find most common word in entity names
  const counts = entityNames.reduce((acc, cur) => {
    acc[cur] = (acc[cur] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const sorted = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .filter((word) => word.length > 1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  return sorted[0];
};

export const getGroupSnippet = (
  id: string,
  friendlyName: string,
  entities: string[]
): SnippetString => {
  const group = {
    [id]: {
      name: friendlyName,
      view: "no",
      entities,
    },
  };
  const snippet = new YAML.Document();
  snippet.contents = group;

  return new SnippetString(snippet.toString());
};
