import {
  LitElement,
  html,
  svg,
  css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

import { thermoProTP86xbStyles } from "/local/thermopro-tp86xb/thermopro-tp86xb-styles.js";

// Default upper bound for the device width; override with the max_width option.
const DEFAULT_MAX_WIDTH = "360px";

class ThermoProTP86xb extends LitElement {
  static styles = thermoProTP86xbStyles;

  static get properties() {
    return {
      hass: {},
      config: {},
      source_unit: "C",
      display_unit: "",
      show_decimal: false,
    };
  }

  constructor() {
    super();
    // Last known probe battery level (0..3) per probe color. Messages relayed
    // by the booster don't carry the probe battery, so we keep the last value
    // reported directly by the probe (is_probe == 1).
    this._probeBattery = { black: null, white: null };
  }

  render() {
    const stateObj1 = this.hass.states[this.config.entities[0]];
    const stateObj2 = this.hass.states[this.config.entities[1]];
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
      <div class="thermopro-tp86xb-container">
        <div class="thermopro-tp86xb-card">
          <div class="thermopro-tp86xb-image">
            ${attributesArr1[`is_docked`] === 0 ? html`` : html`<img class="probe black" src="/local/thermopro-tp86xb/thermopro-tp86xb-b.png"/>`}
            ${attributesArr2[`is_docked`] === 0 ? html`` : html`<img class="probe white" src="/local/thermopro-tp86xb/thermopro-tp86xb-w.png"/>`}
            <img class="base" src="/local/thermopro-tp86xb/thermopro-tp86xb.png"/>
          </div>
          <div class="thermopro-tp86xb-display">
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
          </div>
        </div>
      </div>
    `;
  }

  updateProbeBattery(attributesArr, color) {
    if (Number(attributesArr[`is_probe`]) !== 1) {
      return;
    }
    const level = Number(attributesArr[`probe_batery`]);
    if (Number.isInteger(level) && level >= 0 && level <= 3) {
      this._probeBattery[color] = level;
    }
  }

  // Always rendered (hidden via opacity) so the probe label doesn't shift.
  renderBattery(level, visible) {
    const known = level !== null && level !== undefined;
    const bars = known ? [2.5, 9, 15.5].slice(0, level) : [];
    return html`
      <svg class="battery ${visible && known ? "" : "hidden"}" viewBox="0 0 26 12" xmlns="http://www.w3.org/2000/svg">
        <rect class="battery-body" x="0.75" y="0.75" width="21.5" height="10.5" rx="1"/>
        <rect class="battery-cap" x="22.5" y="3.5" width="2.5" height="5"/>
        ${bars.map((x) => svg`<rect class="battery-bar" x="${x}" y="2.75" width="5" height="6.5"/>`)}
      </svg>
    `;
  }

  renderProbe(attributesArr, color) {
    this.updateProbeBattery(attributesArr, color);
    const temperature_int = this.convertTemperature(
      attributesArr[`temperature_int_${this.source_unit}`],
      attributesArr[`is_docked`]
    );
    const temperature_amb = this.convertTemperature(
      attributesArr[`temperature_amb_${this.source_unit}`],
      attributesArr[`is_docked`]
    );
    const hasInt = this.isValidTemperature(temperature_int);
    const hasAmb = this.isValidTemperature(temperature_amb);
    return html`
      <div class="probe-display">
        <div class="header">
          <span class="probe-id">probe ${color}</span>
          ${this.renderBattery(this._probeBattery[color], hasInt || hasAmb)}
        </div>
        <div class="temp">
          <div class="temp-type"><span>Internal</span></div>
          <div class="temp-num">
            <span>
              ${this.formatTemperature(temperature_int, hasInt)}
            </span>
          </div>
        </div>
        <div class="temp">
          <div class="temp-type"><span>Ambient</span></div>
          <div class="temp-num">
            <span>
              ${this.formatTemperature(temperature_amb, hasAmb)}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  formatTemperature(temperature, isValid) {
    if (!isValid) {
      return this.show_decimal ? "---.-" : "---";
    }
    return temperature.toFixed(this.show_decimal ? 1 : 0);
  }

  isValidTemperature(temperature) {
    return !(!temperature || isNaN(temperature));
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
    if (config.show_decimal !== undefined && typeof config.show_decimal !== "boolean") {
      throw new Error("show_decimal must be true or false (default).");
    }
    this.show_decimal = config.show_decimal === true;
    this.style.setProperty("--tp86xb-max-width", this.parseMaxWidth(config.max_width));
    this.config = config;
  }

  // Accepts a number (pixels) or any CSS length, e.g. 400, "400px", "30vw".
  parseMaxWidth(maxWidth) {
    if (maxWidth === undefined || maxWidth === null) {
      return DEFAULT_MAX_WIDTH;
    }
    if (typeof maxWidth === "number" && maxWidth > 0) {
      return `${maxWidth}px`;
    }
    if (typeof maxWidth === "string" && CSS.supports("max-width", maxWidth)) {
      return maxWidth;
    }
    throw new Error(
      `Invalid max_width: ${maxWidth}. Use a number of pixels or a CSS length (e.g. "400px").`
    );
  }

  // The height of the card in 50px units. Home Assistant uses this to
  // distribute cards over the available columns in masonry view.
  getCardSize() {
    const height = this.offsetHeight;
    return height > 0 ? Math.ceil(height / 50) : 13;
  }

  // The rules for sizing the card in the grid in sections view. The device is
  // scaled to fit whatever cell size the user picks, keeping its proportions.
  getGridOptions() {
    return {
      columns: 12,
      rows: 9,
      min_columns: 4,
      min_rows: 4,
    };
  }
}

customElements.define("thermopro-tp86xb", ThermoProTP86xb);
