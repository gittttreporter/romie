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
    async loadDeviceById(id: string): Promise<Device | null> {
      const findDevice = (d: Device) => d.id === id;
      const cachedDevice = this.devices.find(findDevice);
      if (cachedDevice) return cachedDevice;

      // TODO: Implement device specific loading logic. The total number of devices
      // is limited so the impact of fetching everything to find one should be small.
      try {
        this.loading = true;
        await this.loadDevices();

        return this.devices.find(findDevice);
      } catch (error) {
        // todo
      } finally {
        this.loading = false;
      }
    },
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
