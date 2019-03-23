# Home Assistant Config Helper for VS Code

This the Home Assistant Extension for VS Code. By being connected to Home Assistant it provides auto completion for your entity_id's.

Then when you type ```entity_id:``` (or any entity related property) the autocomplete list should be populated with your entities:

![Intellisense](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/master/assets/screenshot.gif)

## Configuration

After installation, this extension needs your... 
- **Home Assistant Root URL** and a 
- **Long Lived Access Token** 

...to be able to connect to your Home Assistant Server. 

There are 3 ways to get this done:

1. Via the wizard, wait for the popup to show:

    ![Popup](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/master/assets/popup.png)

    This popup will only show if your workspace contains a configuration.yaml file and enables you to set the configuration on user-level 

2. Via the default VS Code Settings UI

    Set the values with the default settings editor of VS Code: to open the VS Code settings, go to (cmd+shift+p) *'Preferences: Open Settings (UI)'*, then go to *'Extensions'* and then *'Home Assistant'*. Please note the difference between 'User Settings' and 'Workspace Settings', by default the extension sets them on User-level but they can be overridden at workspace level.

3. Via Environment Variables

    Set the `HASS_SERVER` and `HASS_TOKEN` Environment Variables. This is convenient when you're using both this extension and the [Home Assistant CLI](https://github.com/home-assistant/home-assistant-cli). The extension will only use these Environment Variables when you have not set any setting in VS Code.

    Remember the scope of your environment variables differs per OS. Usually for this to work, you need to start VS Code from the from the prompt where the environment variables are set.

## Release Notes

### v0.3 - 23-03-2019
 
- New: Autocompletion for services (#4)
- New: Snippets for automations, sensors, scripts and groups (by @michalchecinski)  
- New: Config HASS_SERVER & HASS_TOKEN environment variables (single config with HA CLI) 
- Fixed: Multi-line entity id completion at first line (by @mickdekkers) 
- Fixed: Keep configuration input boxes open when they lose focus  (by @mickdekkers) 
- Fixed: Extension not working when workspace is opened via SSH FS 

### v0.1 17-03-2019

 - Initial release with autocompletion for entity_id's

## Feedback / Ideas

Reach out to me on [Twitter](https://twitter.com/keesschollaart) or the [Home Assistant Discord](https://discord.gg/c5DvZ4e).

## Things to do / up for grabs

[] Extract JSON scheme from HA to enable validation/completion on 'everything' static
[] Render template locally (like/via CLI?) in preview pane 