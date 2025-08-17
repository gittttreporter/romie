<template>
  <Dialog
    :visible="visible"
    :header="`Add Device (${props.storageDevice.label})`"
    :style="{ width: '50vw' }"
    :modal="true"
    @show="handleShow"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="device-add-form">
      <div class="device-add-form__form-item">
        <label for="name">Device Name</label>
        <InputText
          id="name"
          aria-describedby="name-help"
          v-model="deviceForm.name"
        />
      </div>
      <div class="device-add-form__form-item">
        <label for="deviceprofile">Device Profile</label>
        <Select
          v-model="deviceForm.profileId"
          :options="deviceProfileOptions"
          optionValue="value"
          optionLabel="name"
          placeholder="Select a Device Profile"
        />
        <Message size="small" severity="secondary" variant="simple"
          >Device profiles optimize how ROMie syncs and organizes your games
          based on your handheld device's operating system.</Message
        >
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancel"
        :disabled="saving"
        severity="secondary"
        @click="handleCancel"
      />
      <Button
        :label="saving ? 'Adding...' : 'Add Device'"
        :loading="saving"
        @click="handleSubmit"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Select from "primevue/select";
import { useDeviceStore } from "@/stores";
import { getAllDeviceProfiles } from "@/utils/device-profiles";

import type { Device, StorageDevice } from "@/types/device";

const props = defineProps<{
  visible: boolean;
  storageDevice: StorageDevice;
}>();
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "created", device: Device): void;
}>();
const deviceStore = useDeviceStore();

const saving = ref(false);
const deviceForm = ref({
  name: "",
  profileId: "",
});

const deviceProfileOptions = getAllDeviceProfiles().map((profile) => ({
  name: profile.name,
  value: profile.id,
}));

function handleShow() {
  // Set default values for the form fields
  deviceForm.value.name = props.storageDevice?.label || "";
  deviceForm.value.profileId = "generic";
}

function handleCancel() {
  // Reset the form fields
  deviceForm.value.name = "";
  deviceForm.value.profileId = "";

  // Close the modal
  emit("update:visible", false);
}

async function handleSubmit() {
  saving.value = true;
  const draftDevice: Device = {
    name: deviceForm.value.name,
    profileId: deviceForm.value.profileId,
    deviceInfo: { ...props.storageDevice },
  };

  try {
    const newDevice = await window.device.create(draftDevice);
    await deviceStore.loadDevices();
    emit("created", newDevice);
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="less">
.device-add-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.device-add-form__form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.device-add-form__form-item label {
  font-weight: bold;
}

.device-add-form__form-item input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
}

.device-add-form__form-item select {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
}

.device-add-form__form-item .p-message {
  margin-top: 0.5rem;
}
</style>
