/**
 * Normalised live-energy snapshot derived from VRM `system-overview` +
 * `stats?type=live_feed` so the UI never has to know the wire format.
 *
 * Every field is optional — installations vary wildly (some have no PV,
 * some no battery, etc.) and the UI hides any block whose value is null.
 */
export interface VictronSnapshot {
  /** When VRM last reported any data (epoch seconds). */
  lastUpdate: number | null;
  /** True if VRM marks the installation as currently reporting. */
  isOnline: boolean;

  /** Instantaneous values, in Watts. Positive = producing/consuming, sign
   *  follows VRM convention (battery: + charging, − discharging). */
  pvPowerW: number | null;
  batteryPowerW: number | null;
  loadPowerW: number | null;
  gridPowerW: number | null;
  generatorPowerW: number | null;

  /** Battery state of charge, 0–100. */
  batterySoc: number | null;
  /** Battery voltage in V (for technical clients). */
  batteryVoltageV: number | null;

  /** Energy totals for the local day, in kWh. */
  pvYieldTodayKwh: number | null;
  consumptionTodayKwh: number | null;
  gridFromTodayKwh: number | null;
  gridToTodayKwh: number | null;

  /** Site identity echoed for the UI. */
  idSite: number;
  displayName: string | null;
}

export const EMPTY_SNAPSHOT = (idSite: number, displayName: string | null): VictronSnapshot => ({
  lastUpdate: null,
  isOnline: false,
  pvPowerW: null,
  batteryPowerW: null,
  loadPowerW: null,
  gridPowerW: null,
  generatorPowerW: null,
  batterySoc: null,
  batteryVoltageV: null,
  pvYieldTodayKwh: null,
  consumptionTodayKwh: null,
  gridFromTodayKwh: null,
  gridToTodayKwh: null,
  idSite,
  displayName,
});
