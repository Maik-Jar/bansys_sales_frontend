<script>
  import { urls } from "../../lib/utils/urls";
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { Input, Label, Helper, Button, Heading } from "flowbite-svelte";

  const credentials = Object.seal({
    username: null,
    password: null,
  });

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
  <div class="mb-10">
    <Heading tag="h1">Login</Heading>
  </div>
  <div class="flex flex-col justify-center mb-6 w-2/6">
    <div class="mb-6">
      <Label for="username" class="mb-2 dark:text-gray-500">Usuario</Label>
      <Input
        type="text"
        id="username"
        placeholder="username"
        bind:value={credentials.username}
        required
      />
    </div>
    <div class="mb-10">
      <Label for="password" class="mb-2 dark:text-gray-500">Contraseña</Label>
      <Input
        type="password"
        id="password"
        placeholder="•••••••••"
        bind:value={credentials.password}
        required
      />
    </div>
    <Button type="submit" class="place-self-center  w-1/2">Entrar</Button>
  </div>
</form>
