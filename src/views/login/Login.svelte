<script>
  import { urls } from "../../lib/utils/urls";
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { Input, Label, Button, Heading } from "flowbite-svelte";

  const credentials = Object.seal({
    username: null,
    password: null,
  });

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  function login() {
    fetch(urls.backendRoute + urls.login, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", JSON.stringify(data));
        localStorage.setItem("isLogin", JSON.stringify(true));
        navigateTo("/");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Usuario o contraseña invalida!",
        });
      }
    });
  }
</script>

<form
  on:submit|preventDefault|stopPropagation={login}
  class="h-screen w-screen flex flex-col items-center justify-center"
>
  <div class="mb-10 flex flex-col justify-items-center">
    <img src="/bansys-sales-logo.svg" alt="" width="900" height="350" />
    <Heading tag="h1" class="text-center mt-5 text-zinc-800">Login</Heading>
  </div>
  <div class="flex flex-col justify-center mb-6 w-2/6">
    <div class="mb-6">
      <Label for="username" class="mb-2 {customColorsClassDark.label}"
        >Usuario</Label
      >
      <Input
        type="text"
        id="username"
        class={customColorsClassDark.input}
        placeholder="username"
        bind:value={credentials.username}
        required
      />
    </div>
    <div class="mb-10">
      <Label for="password" class="mb-2 {customColorsClassDark.label}"
        >Contraseña</Label
      >
      <Input
        type="password"
        id="password"
        class={customColorsClassDark.input}
        placeholder="•••••••••"
        bind:value={credentials.password}
        required
      />
    </div>
    <Button type="submit" class="place-self-center  w-1/2">Entrar</Button>
  </div>
</form>
