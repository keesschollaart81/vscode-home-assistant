<h1 align="center">

<img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/header.png" alt="Home Assistant Config Helper for Visual Studio Code"/>

</h1>

## Getting started
      
1. [Get/Install from the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=keesschollaart.vscode-home-assistant)

2. Make sure the Language is set to 'Home Assistant'

    <img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/select_language.png"/>

    [The VS Code docs](https://code.visualstudio.com/docs/languages/overview#_changing-the-language-for-the-selected-file) also explain how to set the 'Home Assistant' language as default for '.yaml' or for a workspace (via a settings file).

## Completion for Entity ID's & Services

When connected with your Home Assistant server, entity id' and services will be auto-completed.
 
<img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/entity_service_completion.gif"   > 

## Completion & Validation for Configuration & Lovelace Schema

Most of the scheme's of Home Assistant will be validated and things like properties, values and enums will be auto-completed. This extension understands the behaviour of Home Assistant '!include...' behaviour and use this to provide scoped validation for all your files.
 
<img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/schema_validation_completion.gif"  > 

## Go to Definition for Includes

Easy navigate between your files references via the different !include... tags using 'f12' / 'Go to Definition'.
 
<img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/go_to_definition.gif"  > 

## Snippets

Snippets allow you to create commonly used data structures very quickly. 

<img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/snippet.gif"   > 

## Configuration

After installation, this extension needs your...
- **Home Assistant Root URL** and a
- **Long Lived Access Token**

...to be able to connect to your Home Assistant Server.

There are 2 ways to get this done:

1. Via the default VS Code Settings UI

    Set the values with the default settings editor of VS Code: to open the VS Code settings, go to (cmd+shift+p) *'Preferences: Open Settings (UI)'*, then go to *'Extensions'* and then *'Home Assistant'*. Please note the difference between 'User Settings' and 'Workspace Settings', by default the extension sets them on User-level but they can be overridden at workspace level.

2. Via Environment Variables

    Set the `HASS_SERVER` and `HASS_TOKEN` Environment Variables. This is convenient when you're using both this extension and the [Home Assistant CLI](https://github.com/home-assistant/home-assistant-cli). The extension will only use these Environment Variables when you have not set any setting in VS Code.

    Remember the scope of your environment variables differs per OS. Usually for this to work, you need to start VS Code from the from the prompt where the environment variables are set.

## Release Notes

### v0.5 - 10-05-2019

- New: Schema Validation/completion for most data structures
- New: Go to Definition for include-references
- New: HA As a Language Server (enabling other IDE's in later stage)

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
  