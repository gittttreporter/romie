<template>
  <aside class="app-sidebar">
    <div
      class="app-sidebar__section"
      v-for="section in sections"
      :key="section.id"
    >
      <h4 v-if="section.title" class="app-sidebar__title">
        {{ section.title }}
      </h4>
      <ul
        v-if="section.id === 'tags'"
        class="app-sidebar__items app-sidebar__items--tags"
      >
        <li v-for="item in section.items">
          <RouterLink
            :to="item.route"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
            v-slot="{ isActive }"
          >
            <Tag
              :severity="isActive ? 'contrast' : 'secondary'"
              :key="item.id"
              :value="item.label"
            ></Tag>
          </RouterLink>
        </li>
        <li
          v-if="section.items.length === 0"
          class="app-sidebar__item app-sidebar__item--empty"
        >
          No tags yet
        </li>
      </ul>
      <ul v-else class="app-sidebar__items">
        <li v-for="item in section.items" :key="item.id">
          <RouterLink
            :to="item.route"
            class="app-sidebar__item"
            active-class="app-sidebar__item--active"
          >
            <span class="app-sidebar__icon" v-if="item.icon">
              <i :class="item.icon"></i>
            </span>
            <span class="app-sidebar__label">{{ item.label }}</span>
            <Badge
              v-if="item.count"
              :value="item.count"
              severity="secondary"
              class="app-sidebar__count"
            />
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="app-sidebar__footer">
      <div class="app-sidebar__section">
        <ul class="app-sidebar__items">
          <li>
            <RouterLink
              :to="{ name: 'settings' }"
              class="app-sidebar__item"
              active-class="app-sidebar__item--active"
            >
              <span class="app-sidebar__icon">
                <i class="pi pi-cog"></i>
              </span>
              <span class="app-sidebar__label">Settings</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
    <!-- <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" /> -->
  </aside>
</template>

<script setup lang="ts">
import log from "electron-log";
import { RouterLink } from "vue-router";
import { computed, ref, onMounted, ComputedRef } from "vue";
import Badge from "primevue/badge";
import Tag from "primevue/tag";
import { useRomStore } from "@/stores";
import { getSystemDisplayName } from "@/utils/system.utils";

import type { RouteLocationRaw } from "vue-router";
import type { SystemCode } from "@/types/system";

// prettier-ignore
const SYSTEM_SORT_ORDER: SystemCode[] = [
  'nes','snes','n64','gb','gbc','gba', // Nintendo
  'sms','genesis','gg',                // Sega
  'psx',                               // Sony
  'atari2600',                         // Atari
  'arcade'                             // Arcade
];

const romStore = useRomStore();

interface SidebarItem {
  id: string;
  label: string;
  count?: number;
  icon?: string;
  route: RouteLocationRaw;
}

interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

onMounted(() => {
  romStore.loadStats();
  romStore.loadRoms();
});

const systemsSection = computed((): SidebarSection => {
  const systems = Object.entries(romStore.stats.systemCounts) as [
    SystemCode,
    number,
  ][];
  const items: SidebarItem[] = [];

  systems.sort((a, b) => {
    return SYSTEM_SORT_ORDER.indexOf(a[0]) - SYSTEM_SORT_ORDER.indexOf(b[0]);
  });

  systems.forEach(([system, count]) => {
    items.push({
      id: `system-${system}`,
      label: getSystemDisplayName(system),
      count,
      route: {
        name: "system-detail",
        params: { system },
      },
    });
  });

  return { id: "systems", title: "Systems", items };
});

const tagsSection = computed((): SidebarSection => {
  // Collect tag counts
  const tagCounts: Record<string, number> = {};
  romStore.roms.forEach((rom) => {
    if (Array.isArray(rom.tags)) {
      rom.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  // Build tag list sorted alphabetically
  const items = Object.keys(tagCounts)
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({
      id: `tag-${tag}`,
      label: tag,
      count: tagCounts[tag],
      icon: "pi pi-tag",
      route: {
        name: "tag-detail",
        params: { tag },
      },
    }));

  return {
    id: "tags",
    title: "Tags",
    items,
  };
});

const sections = computed((): SidebarSection[] => [
  {
    id: "library",
    items: [
      {
        id: "import",
        label: "Import",
        icon: "pi pi-upload",
        route: {
          name: "import",
        },
      },
      {
        id: "all-roms",
        label: "Library",
        count: romStore.stats.totalRoms,
        icon: "pi pi-folder",
        route: {
          name: "library",
        },
      },
      {
        id: "favorites",
        label: "Favorites",
        count: romStore.roms.reduce(
          (acc, rom) => acc + (rom.favorite ? 1 : 0),
          0,
        ),
        icon: "pi pi-heart",
        route: {
          name: "favorites",
        },
      },
    ],
  },
  systemsSection.value,
  tagsSection.value,
]);
</script>

<style scoped lang="less">
.app-sidebar {
  width: 220px;
  border-right: 1px solid var(--p-content-border-color);
  padding: 12px 0 0 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  &__section {
    margin-bottom: 16px;
  }

  &__title {
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--p-navigation-submenu-label-color);
    margin: 0 16px 8px 16px;
    padding: 0;
  }

  &__items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__items--tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 14px;

    .app-sidebar__item {
      padding: 0;
      margin: 0;
    }

    .app-sidebar__item--empty {
      font-size: var(--font-size-sm);
      color: var(--p-text-muted-color);
    }
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    cursor: pointer;
    border-radius: 6px;
    margin: 0 8px;
    transition: all 0.15s ease;
    line-height: 1.4;
    text-decoration: none;
    color: inherit;

    &:hover,
    &:focus {
      background: var(--p-navigation-item-focus-background);
      color: var(--p-navigation-item-focus-color); // If available
    }

    &--active {
      background: var(--p-navigation-item-active-background);
      color: var(--p-navigation-item-active-color);
    }
  }

  &__icon {
    margin-right: 8px;
    opacity: 0.7;
    font-size: 12px;
    color: var(--p-text-muted-color);
  }

  &__label {
    flex: 1;
    font-weight: 400;
  }

  &__count {
    font-size: 11px;
    opacity: 0.7;
    font-weight: 500;
    margin-left: auto;
  }

  &__header {
    padding: 4px 16px;
  }

  &__footer {
    margin-top: auto;
  }
}
</style>
