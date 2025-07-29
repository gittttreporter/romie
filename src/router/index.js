import { createRouter, createWebHashHistory } from "vue-router";

import LibraryView from "@/views/LibraryView.vue";
import FavoritesView from "@/views/FavoritesView.vue";
import RecentlyAddedView from "@/views/RecentlyAddedView.vue";
import TagView from "@/views/TagView.vue";
import RomDetailView from "@/views/RomDetailView.vue";
import RomImportView from "@/views/RomImportView.vue";
import SettingsView from "@/views/SettingsView.vue";

const routes = [
  {
    path: "/",
    redirect: "/library",
  },
  {
    path: "/library",
    name: "library",
    component: LibraryView,
    children: [
      {
        path: ":id",
        name: "rom-detail",
        component: RomDetailView,
        props: true,
      },
    ],
  },
  {
    path: "/import",
    name: "import",
    component: RomImportView,
  },
  {
    path: "/favorites",
    name: "favorites",
    component: FavoritesView,
  },
  {
    path: "/recent",
    name: "recent",
    component: RecentlyAddedView,
  },
  {
    path: "/tags/:tag",
    name: "tag-detail",
    component: TagView,
    props: true,
    children: [
      {
        path: ":id",
        name: "TagRomDetail",
        component: RomDetailView,
        props: true,
      },
    ],
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
