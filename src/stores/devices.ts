import { defineStore } from "pinia";
import type { Device, StorageDevice } from "@/types/device";
import { DeviceProfile } from "@romie/device-profiles";

interface DeviceState {
  devices: Device[];
  profiles: DeviceProfile[];
  loading: boolean;
  error: string | null;
}

export const useDeviceStore = defineStore("devices", {
  state: (): DeviceState => ({
    devices: [],
    profiles: [],
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

        return this.devices.find(findDevice) || null;
      } catch (error) {
        // todo
      } finally {
        this.loading = false;
      }

      return null;
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
    async loadDeviceProfiles(): Promise<void> {
      try {
        this.loading = true;
        this.profiles = await window.device.listProfiles();
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
