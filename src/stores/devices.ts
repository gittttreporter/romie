import { defineStore } from "pinia";
import type { Device, StorageDevice } from "@/types/device";

interface DeviceState {
  devices: Device[];
  loading: boolean;
  error: string | null;
}

export const useDeviceStore = defineStore("devices", {
  state: (): DeviceState => ({
    devices: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadDevices() {
      try {
        this.loading = true;
        this.devices = await window.device.list();
      } catch (error) {
        // todo
      } finally {
        this.loading = false;
      }
    },
    async createDevice(device: Device) {
      try {
        this.loading = true;
      } catch (error) {
        // todo
      } finally {
        this.loading = false;
      }
    },
  },
});
