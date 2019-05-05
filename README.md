# Home Assistant Config Helper for VS Code

This the Home Assistant Extension for VS Code. By being connected to Home Assistant it provides auto completion for your entity_id's.


** Completion for Entity ID's & Services **

When connected with your Home Assistant server, entity id' and services will be auto-completed.

![entity service completion](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/entity_service_completion.gif  | width=100)

** Completion & Validation for Configuration & Lovelace Schema **

Most of the scheme's of Home Assistant will be validated and things like properties, values and enums will be auto-completed. This extension understands the behaviour of Home Assistant '!include...' behaviour and use this to provide scoped validation for all your files.

![schema validation completion](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/schema_validation_completion.gif  | width=100)

** Go to Definition for Includes ** 

Easy navigate between your files references via the different !include... tags using 'f12' / 'Go to Definition'.

![go to definition](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/go_to_definition.gif  | width=100)

** Snippets **

Snippets allow you to create commonly used data structures very quickly. 

![go to definition](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/snippet.gif =250x)

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

## Build & Deployment status



|                     | Master   | Dev  |
|--------------------------------|-----------------|-----------------|
| Build status |  [![Build Status](https://caseonline.visualstudio.com/vscode-home-assistant/_apis/build/status/keesschollaart81.vscode-home-assistant?branchName=master)](https://caseonline.visualstudio.com/vscode-home-assistant/_build/index?definitionId=23)   | [![Build Status](https://caseonline.visualstudio.com/vscode-home-assistant/_apis/build/status/keesschollaart81.vscode-home-assistant?branchName=dev)](https://caseonline.visualstudio.com/vscode-home-assistant/_build/index?definitionId=23)
| Deployment Status | TODO |[![Deployment Status](https://caseonline.vsrm.visualstudio.com/_apis/public/Release/badge/b5e7419e-352f-433e-8690-463d52b2c4f7/1/1)](https://caseonline.visualstudio.com/vscode-home-assistant/_releases2?definitionId=1)|  
| Get it | [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/keesschollaart.vscode-home-assistant.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=vscoss.vscode-ansible) | [![GitHub release](https://img.shields.io/github/release-pre/keesschollaart81/vscode-home-assistant.svg)](https://github.com/keesschollaart81/vscode-home-assistant/releases)|  
  