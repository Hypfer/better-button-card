# better-button-card
Basically button-card but rewritten to not depend on Polymer components from third party CDNs

Also, the configuration is slightly different since I've fixed a few bad design choices


## Features
  - state display
  - custom state-depended color
  - custom size
  - custom icon
    - customizable action on tap
       - none
       - `toggle`
       - `more_info`
       - call any `service`
    - 2 color styles
      - `icon` : apply color settings to the icon only
      - `background` : apply color settings to the card only
  - automatic color for lights with `rgb_color` attribute
  - custom css styles
  - support unit of measurement
  - support for cards without entities for layouting purposes


## Options

| Name | Type | Default | Supported options  | Description
| ---- | ---- | ------- | --------- | -----------
| type | string | **required** | `custom:better-button-card` | Type of the card
| title | string | optional | `Foo bar` | Display a title on top of the card
| entity | string | optional | `switch.ac` | entity_id
| label | string | optional | `Your ad here` | Custom label. Leave undefined to default to `friendly_name` attribute
| show_label | boolean | optional | `false` | Hide label
| show_state_label | boolean | optional | `false` | Hide the textual representation of the entity state
| icon | string | optional | `mdi:air-conditioner` | Icon to display.
| icon_size | string | optional | `40%` | Icon size.
| fallback_color | string | optional | `#ffffff` | The color used if we're unable to determine the color by state.
| colors_by_state | object | optional | `some_state: "yellow"` | Set colors for each state. Use `auto` to fetch from `rgb_color` if it exists.
| color_style | string | optional | `background` or `icon` | Determines how the color should be applied. See feature list above
| style | list | optional | `- text-transform: none` | Custom css attributes for the card
| action | string | optional | undefined or `toggle`, `more_info`, `service` | Define what should happen if the card is clicked
| service | object | optional | 3 Properties: `domain`, `action`, `data` | If action is set to `service`, this defines which service is called with what

## Instructions

* Download [better-button-card](https://raw.githubusercontent.com/hypfer/better-button-card/master/better-button-card.js)
* Place the file in your `config/www` folder
* Include the card code in your `ui-lovelace-card.yaml`
```yaml
title: Home
resources:
  - type: module
    url: /local/better-button-card.js
    
```
* Write configuration for the card in your `ui-lovelace.yaml`