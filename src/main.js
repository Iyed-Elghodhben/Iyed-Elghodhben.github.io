import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { reveal } from "./directives/reveal";
import { trackView } from "./directives/trackView";

createApp(App).directive("reveal", reveal).directive("track-view", trackView).mount("#app");
