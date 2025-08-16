import { createApp } from "vue";
import { createPinia } from "pinia";
import { router } from "./routes/routes.js";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Quasar, Notify } from "quasar";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

import "./style.css";
import App from "./App.vue";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.css";

const app = createApp(App);

app.use(router);

app.use(Quasar, {
  plugins: {
    Notify,
  },
});

app.use(pinia);
app.mount("#app");
