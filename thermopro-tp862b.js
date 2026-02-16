import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

import { thermoProTP862bStyles } from "/local/thermopro-tp862b/thermopro-tp862b-styles.js";

class ThermoProTP862b extends LitElement {
  static styles = thermoProTP862bStyles;

  static get properties() {
    return {
      hass: {},
      config: {},
      source_unit: "C",
      display_unit: "",
    };
  }

  render() {
    return html`
      <div class="thermopro-tp862b-container">
        <div class="thermopro-tp862b-card">
          <div class="thermopro-tp862b-image">
            <img class="probe black" src="/local/thermopro-tp862b/thermopro-tp862b-b.png"/>
            <img class="probe white" src="/local/thermopro-tp862b/thermopro-tp862b-w.png"/>
            <img class="base" src="/local/thermopro-tp862b/thermopro-tp862b.png"/>
          </div>
          <div class="thermopro-tp862b-display">
            ${this.renderDisplay(this.hass.states[this.config.entities[0]], this.hass.states[this.config.entities[1]])}
          </div>
        </div>
      </div>
    `;
  }

  renderDisplay(stateObj1, stateObj2) {
    if (!(stateObj1 && "attributes" in stateObj1 && stateObj1.attributes)) {
      console.error("Entity[0] state must provide attributes.\n" + stateObj1);
      return html``;
    }
    if (!(stateObj2 && "attributes" in stateObj2 && stateObj2.attributes)) {
      console.error("Entity[1] state must provide attributes.\n" + stateObj1);
      return html``;
    }
    if (!this.display_unit) {
      this.display_unit = this.hass.config.unit_system.temperature
        .toUpperCase()
        .at(-1);
    }
    let attributesArr1 = stateObj1.attributes;
    let attributesArr2 = stateObj2.attributes;
    if (stateObj1.attributes[`color`] === "white" || stateObj2.attributes[`color`] === "black") {
      attributesArr1 = stateObj2.attributes;
      attributesArr2 = stateObj1.attributes;
    }
    return html`
      <div class="lcd-screen">
        <svg class="divider" xmlns="http://www.w3.org/2000/svg">
          <line x1="50%" y1="2%" x2="50%" y2="50%"/>
          <circle cx="50%" cy="57%" r="7%" fill="none"/>
          <line x1="50%" y1="64%" x2="50%" y2="98%"/>
        </svg>
        ${this.renderProbe(attributesArr1, "black")}
        ${this.renderProbe(attributesArr2, "white")}
        <div class="unit">
          <span>°${this.display_unit}</span>
        </div>
      </div>
    `;
  }

  renderProbe(attributesArr, color) {
    const temperature_int = this.convertTemperature(
      attributesArr[`temperature_int_${this.source_unit}`],
      attributesArr[`is_docked`]
    );
    const temperature_amb = this.convertTemperature(
      attributesArr[`temperature_amb_${this.source_unit}`],
      attributesArr[`is_docked`]
    );
    return html`
      <div class="probe-display">
        <div class="header"><span class="probe-id">probe ${color}</span></div>
        <div class="temp">
          <div class="temp-type"><span>Internal</span></div>
          <div class="temp-num">
            <span>
              ${!temperature_int || isNaN(temperature_int) ? "---.-" : temperature_int.toFixed(1)}
            </span>
          </div>
        </div>
        <div class="temp">
          <div class="temp-type"><span>Ambient</span></div>
          <div class="temp-num">
            <span>
              ${!temperature_amb || isNaN(temperature_amb) ? "---.-" : temperature_amb.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  convertTemperature(temperature, is_docked) {
    if (is_docked || isNaN(temperature)) {
      return null;
    }
    if (temperature < -99 || temperature > 537) {
      console.error(`Invalid temperature value: ${temperature}`);
      return null;
    }
    switch (this.source_unit + this.display_unit) {
      case "CF":
        return (temperature * 9) / 5 + 32;
      case "FC":
        return ((temperature - 32) * 5) / 9;
      default:
        console.error(`Invalid units: ${this.source_unit + this.display_unit}`);
    }
    return null;
  }

  setConfig(config) {
    if (!config.entities || config.entities.length != 2) {
      throw new Error(
        "You need to define two entities corresponding to the each thermometer probe's attributes pulled from an MQTT topic."
      );
    }
    if (config.source_unit) {
      if (
        typeof config.source_unit !== "string" ||
        !["C", "F"].includes(config.source_unit.toUpperCase())
      ) {
        throw new Error(
          "Unsupported source temperature unit. Supported units are C (default) & F."
        );
      }
      this.source_unit = config.source_unit.toUpperCase();
    } else {
      this.source_unit = "C";
    }
    if (config.display_unit) {
      if (
        typeof config.display_unit !== "string" ||
        !["C", "F"].includes(config.display_unit.toUpperCase())
      ) {
        throw new Error(
          "Unsupported temperature display unit. Supported units are C (default) & F."
        );
      }
      this.display_unit = config.display_unit.toUpperCase();
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns in masonry view
  getCardSize() {
    return 6;
  }

  // The rules for sizing your card in the grid in sections view
  getGridOptions() {
    return {
      rows: 3,
      min_rows: 3,
      max_rows: 6,
      max_columns:3
    };
  }
}

customElements.define("thermopro-tp862b", ThermoProTP862b);
