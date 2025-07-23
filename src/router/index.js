import { createRouter, createWebHashHistory } from "vue-router";

import LibraryView from "@/views/LibraryView.vue";
import FavoritesView from "@/views/FavoritesView.vue";
import RecentlyAddedView from "@/views/RecentlyAddedView.vue";
import CollectionsView from "@/views/CollectionsView.vue";
import CollectionDetailView from "@/views/CollectionDetailView.vue";
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
    path: "/collections",
    name: "collections",
    component: CollectionsView,
  },
  {
    path: "/collections/:collectionId",
    name: "collection-detail",
    component: CollectionDetailView,
    props: true,
  },
  {
    path: "/rom/:romId",
    name: "rom-detail",
    component: RomDetailView,
    props: true,
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
