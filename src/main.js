import "./app.css";
import App from "./App.svelte";

if (!localStorage.getItem("token")) {
  localStorage.setItem("token", "{}");
}

if (!localStorage.getItem("isLogin")) {
  localStorage.setItem("isLogin", JSON.stringify(false));
}

const app = new App({
  target: document.getElementById("app"),
});

export default app;
