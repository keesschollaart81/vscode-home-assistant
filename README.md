# Home Assistant for VS Code

This is a preview / work in progress of the Home Assistant Extension for VS Code. By being connected to Home Assistant it provides auto completion for your entity_id's.

![Intellisense](https://raw.githubusercontent.com/keesschollaart81/vscode-home-assistant/master/assets/screenshot.gif)

## Configuration

Use the settings:

```
vscode-home-assistant.ha-url: "https://my.ha-server:8123"
vscode-home-assistant.ha-token: "<<YOUR LONG LIVED TOKEN>>"
```

Then when you type an ```entity_id``` the autocomplete list should be populated with your entities

## Todo

* Entity_Id dictionaries/aries, currenty only single line is supported
* Easier onboarding (ask for url / token)