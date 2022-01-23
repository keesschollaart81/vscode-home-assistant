import { ExtensionContext } from "vscode";
import {
  HelpAndFeedbackView,
  StandardLinksProvider,
} from "vscode-ext-help-and-feedback-view";
import { extensionId, fullExtensionId } from "../constants";

interface Reload {
  name: string;
  command: string;
}

export function registerHelpAndFeedbackView(context: ExtensionContext): void {
  const standardLinksProvider = new StandardLinksProvider(fullExtensionId);
  const items = [
    {
      icon: "remote-explorer-documentation",
      title: "Home Assistant Documentation",
      url: "https://home-assistant.io/docs/",
    },
    {
      icon: "comment-discussion",
      title: "Home Assistant Community",
      url: "https://community.home-assistant.io/",
    },
    standardLinksProvider.getReviewIssuesLink(),
    standardLinksProvider.getReportIssueLink(),
  ];

  // eslint-disable-next-line
  new HelpAndFeedbackView(context, `${extensionId}.helpAndFeedback`, items);
}
