<h1 align="center">

<img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/header.png" alt="Home Assistant Config Helper for Visual Studio Code"/>

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/keesschollaart.vscode-home-assistant.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=vscoss.vscode-ansible)  [![Build Status](https://caseonline.visualstudio.com/vscode-home-assistant/_apis/build/status/keesschollaart81.vscode-home-assistant?branchName=master)](https://caseonline.visualstudio.com/vscode-home-assistant/_build/index?definitionId=23)

</h1>

# Getting started
      
1. [Get/Install from the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=keesschollaart.vscode-home-assistant)

2. Make sure the Language is set to 'Home Assistant' using the language picker:

    <img src="https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/dev/assets/select_language.png" width="250"/>

    and/or pin it via a `./vscode/settings.json` file in your Home Assistant configuration folder:

    ``` yaml
    {
        "files.associations": {
            "*.yaml": "home-assistant"
        }
    }
    ```
    
    [The VS Code docs](https://code.visualstudio.com/docs/languages/overview#_changing-the-language-for-the-selected-file) also explain how to set the 'Home Assistant' language as default for '.yaml' or for a workspace (via a settings file).

3. Configure the connection to Home Assistant (more info in the [Configuration section below](#Configuration))

# Features

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

# Configuration

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

# Release Notes

## v0.5 - 10-05-2019

- New: Schema Validation/completion for most data structures
- New: Go to Definition for include-references
- New: HA As a Language Server (enabling other IDE's in later stage)

For older release information visit the releases section at [GitHub](https://github.com/keesschollaart81/vscode-home-assistant/releases)

# Feedback / Ideas

Reach out to me on [Twitter](https://twitter.com/keesschollaart) or the [Home Assistant Discord](https://discord.gg/c5DvZ4e).

# Things to do / up for grabs

- [ ] Go to Definition for sntities, scripts and automations
- [ ] Render Jinja2 template locally (like/via CLI?) in preview pane 
- [ ] Autocomplete !secrets
- [ ] Autocomplete triggers
- [ ] Check local config with HA Server

# Build & Deployment status

|                     | Master   | Dev  |
|--------------------------------|-----------------|-----------------|
| Build status |  [![Build Status](https://caseonline.visualstudio.com/vscode-home-assistant/_apis/build/status/keesschollaart81.vscode-home-assistant?branchName=master)](https://caseonline.visualstudio.com/vscode-home-assistant/_build/index?definitionId=23)   | [![Build Status](https://caseonline.visualstudio.com/vscode-home-assistant/_apis/build/status/keesschollaart81.vscode-home-assistant?branchName=dev)](https://caseonline.visualstudio.com/vscode-home-assistant/_build/index?definitionId=23)
| Deployment Status | [![Deployment Status](https://caseonline.vsrm.visualstudio.com/_apis/public/Release/badge/b5e7419e-352f-433e-8690-463d52b2c4f7/1/2)](https://caseonline.visualstudio.com/vscode-home-assistant/_releases2?definitionId=1) |[![Deployment Status](https://caseonline.vsrm.visualstudio.com/_apis/public/Release/badge/b5e7419e-352f-433e-8690-463d52b2c4f7/1/1)](https://caseonline.visualstudio.com/vscode-home-assistant/_releases2?definitionId=1)|  
| Get it | [![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/keesschollaart.vscode-home-assistant.svg "Current Release")](https://marketplace.visualstudio.com/items?itemName=vscoss.vscode-ansible) | [![GitHub release](https://img.shields.io/github/release-pre/keesschollaart81/vscode-home-assistant.svg)](https://github.com/keesschollaart81/vscode-home-assistant/releases)|  
  
# Telemetry

This extension collects telemetry data to help us build a better experience for
using VS Code with Home Assistant. We use [vscode-extension-telemetry](https://github.com/Microsoft/vscode-extension-telemetry),
which reports the following data:

- Extension name
- Extension version
- Machine ID and session ID from VS Code
- Operating system
- Platform version

Additionally, if the language server fails to activate, we report the diagnostic
data the language server produces. The extension respects the `telemetry.enableTelemetry`
setting, which you can learn more about at VS Code's
[telemetry FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).
