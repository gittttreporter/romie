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
      <ul class="app-sidebar__items">
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
import { useRomStore } from "@/stores";
import type { RouteLocationRaw } from "vue-router";

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
  tagsSection.value,
]);
</script>

<style scoped lang="less">
// Theme Variables (move to theme file later)
@sidebar-width: 200px;
@sidebar-bg: #ffffff;
@sidebar-border: #e5e5e5;
@sidebar-text-primary: #1d1d1f;
@sidebar-text-secondary: #86868b;
@sidebar-hover-bg: #f5f5f7;
@sidebar-active-bg: #007aff;
@sidebar-active-text: #ffffff;
@primary-color: #007aff;
@primary-color-text: #ffffff;
@primary-color-hover: #0056cc;

// Dark theme overrides
@sidebar-bg-dark: #1e1e1e;
@sidebar-border-dark: #2d2d2d;
@sidebar-text-primary-dark: #ffffff;
@sidebar-text-secondary-dark: #98989d;
@sidebar-hover-bg-dark: #2c2c2e;

.app-sidebar {
  width: @sidebar-width;
  background: @sidebar-bg;
  border-right: 1px solid @sidebar-border;
  padding: 12px 0 0 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  &__section {
    margin-bottom: 16px;
  }

  &__title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: @sidebar-text-secondary;
    margin: 0 16px 8px 16px;
    padding: 0;
  }

  &__items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 6px 16px;
    cursor: pointer;
    border-radius: 6px;
    margin: 0 8px;
    transition: all 0.15s ease;
    font-size: 14px;
    line-height: 1.4;
    text-decoration: none;
    color: inherit;

    &:hover {
      background: @sidebar-hover-bg;
    }

    &--active {
      background: @sidebar-active-bg;
      color: @sidebar-active-text;

      .app-sidebar__count,
      .app-sidebar__icon {
        opacity: 0.9;
      }
    }
  }

  &__icon {
    margin-right: 8px;
    opacity: 0.7;
    font-size: 12px;
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

  // Dark mode adjustments
  @media (prefers-color-scheme: dark) {
    background: @sidebar-bg-dark;
    border-right-color: @sidebar-border-dark;

    .app-sidebar__title {
      color: @sidebar-text-secondary-dark;
    }

    .app-sidebar__item {
      color: @sidebar-text-primary-dark;

      &:hover {
        background: @sidebar-hover-bg-dark;
      }
    }

    .app-sidebar__footer {
      border-top-color: @sidebar-border-dark;
    }
  }
}
</style>
