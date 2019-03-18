# Home Assistant Config Helper for VS Code

This the Home Assistant Extension for VS Code. By being connected to Home Assistant it provides auto completion for your entity_id's.

Then when you type ```entity_id:``` (or any entity related property) the autocomplete list should be populated with your entities:

![Intellisense](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/master/assets/screenshot.gif)

## Configuration

Install the extension, open your Home Assistant folder and a popup will aks you to set your **Home Assistant Root URL** and a **Long Lived Access Token**. 

To open the VS Code settings, go to (cmd+shift+p) *'Preferences: Open Settings (UI)'*, then go to *'Extensions'* and then *'Home Assistant'*. Please note the difference between 'User Settings' and 'Workspace Settings'.

When you open a workspace containing a **/configuration.yaml file, this extension starts. If you did not set these two settings, it will prompt you to set them. This flow will set your settings on 'Workspace level'.

## Feedback / Ideas

Reach out to me on [Twitter](https://twitter.com/keesschollaart) or the [Home Assistant Discord](https://discord.gg/c5DvZ4e).