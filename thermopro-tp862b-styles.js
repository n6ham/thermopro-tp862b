import { css } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

const baseImageMarginTop = css`14%`;
const probeImageHorizontalPosition = css`15%`;
const probeImageWidth = css`13%`;

export const thermoProTP862bStyles = css`
  @font-face {
    font-family: segment7;
    src: url("/local/7segment.woff") format("woff");
  }
  
  .thermopro-tp862b-container {
    justify-content: center;
    align-items: center;
    width: 100%;
    display: flex;
  }
  
  .thermopro-tp862b-card {
    position: relative;
    justify-content: center;
    text-align: center;
    align-items: center;
    width: 100%;
    aspect-ratio: 1 / 1.285;
    max-width: 568px;
    min-width: 212px; 
    --font-digits: segment7, monospace;
    --font-labels: 'Arial Narrow', sans-serif; /* Condensed look for labels */
  }
  
  .thermopro-tp862b-image .probe {
    display: block;
    position: absolute;
    width: ${probeImageWidth};
    top: 0;
    clip-path: inset(0 0 50%);
    z-index: -1;
  }

  .thermopro-tp862b-image .probe.black {
    left: ${probeImageHorizontalPosition};
  }

  .thermopro-tp862b-image .probe.white {
    right: ${probeImageHorizontalPosition};
  }
  
  .thermopro-tp862b-image .base {
    display: block;
    width: 100%;
    margin-top: ${baseImageMarginTop};
  }

  .thermopro-tp862b-display {
    position: absolute;
    top: 41.6%;
    left: 50%;
    width: 70%;
    height: 43%;
    transform: translate(-50%, -50%);
    color: rgba(0, 0, 0, 0.5);
  }
  
  .lcd-screen {
    width: 100%; 
    height: 100%;
    container-type: inline-size;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 100%;
    text-shadow: 0.125cqw 0.125cqw 0cqw rgba(0, 0, 0, 0.1);
  }
  
  .unit {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 57%;
    left: 50%;
    width: 12cqw;
    height: 12cqw;
  }
  
  .unit span {
    font-size: 10cqw;
    font-weight: bold;
    transform: translate(-16%, 0%);
  }

  .probe-display {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 10% 45% 45%;
    position: relative;
    padding: 0 2cqw;
  }

  .probe-display .header {
    display: flex;
    align-items: center;
    justify-content: space-around;
    font-family: var(--font-labels);
    font-weight: bold;
    font-size: 6cqw;
    text-transform: uppercase;
    padding-top: 5cqw;
  }

  .probe-display .header span {
    transform: scaleY(1.2);
  }

  .divider {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .divider line, .divider circle {
    stroke: rgba(0, 0, 0, 0.5);
    stroke-width: 0.75cqw;
  }

  .probe-display .temp:nth-child(2) {
    padding-top: 6cqw;
  }

  .probe-display .temp:nth-child(3) {
    padding-top: 12cqw;
  }

  .temp-type {
    justify-self: left;
    transform: scaleY(1.2);
  }

  .temp-type span {
    font-family: var(--font-labels);
    font-weight: bold;
    font-size: 5cqw;
    text-transform: uppercase;
  }

  .temp-num {
    justify-self: right;
  }

  .temp-num span {
    font-family: var(--font-digits);
    font-size: 24cqw;
    /* Using a very tight line-height to crop empty font space */
    line-height: 1; 
  }
`;