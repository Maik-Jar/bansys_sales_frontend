<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { documentsTypes, providers } from "../../lib/stores/stores";
  import { hasPermission } from "../../lib/utils/functions";
  import { Heading, Label, Input, Select, Button, Span } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const provider = Object.seal({
    id: null,
    name: null,
    document_type: 1,
    document_id: null,
    phone: null,
    address: null,
    email: null,
  });

  let isEditable = false;

  function updateProvidersList() {
    fetch(urls.backendRoute + urls.providersListEndPoint).then(async (res) => {
      const providers_list = await res.json();
      providers.set(providers_list);
    });
  }

  function getProvider() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.providersEndPoint +
          `?provider_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            provider.id = data.id;
            provider.name = data.name;
            provider.document_type = data.document_type;
            provider.document_id = data.document_id;
            provider.phone = data.phone;
            provider.address = data.address;
            provider.email = data.email;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createProvider() {
    let providerToSave = { ...provider };
    Swal.fire({
      title: "¿Quieres crear este nuevo proveedor?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.providersEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(providerToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              provider.id = data.id;
              Swal.fire("¡Nuevo proveedor creado!", "", "success");
              isEditable = true;
              updateProvidersList();
            } else {
              const message = await res.json();
              Swal.fire("Solicitud incorrecta.", `${message.detail}`, "error");
              console.log(message);
            }
          })
          .catch((error) => {
            Swal.fire("Error interno", `${error.message}`, "error");
            console.log(error.message);
          });
      } else if (result.isDenied) {
        Swal.fire("Operación descartada.", "", "info");
      }
    });
  }

  function updateProvider() {
    let providerToSave = { ...provider };
    Swal.fire({
      title: "¿Quieres guardar los datos?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(
          urls.backendRoute +
            urls.providersEndPoint +
            `?provider_id=${provider.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(providerToSave),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              Swal.fire("¡Datos guardados!", "", "success");
              updateProvidersList();
            } else {
              const message = await res.json();
              Swal.fire("Solicitud incorrecta.", `${message.detail}`, "error");
              console.log(message);
            }
          })
          .catch((error) => {
            Swal.fire("Error interno", `${error.message}`, "error");
          });
      } else if (result.isDenied) {
        Swal.fire("Operación descartada.", "", "info");
      }
    });
  }

  onMount(async () => {
    isEditable =
      (await currentRoute.queryParams.type) == "update" ? true : false;
    getProvider();
  });
</script>

<form
  id="form_provider"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateProvider
    : createProvider}
>
  <div
    class="flex justify-start pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >Código: <Span highlight>{provider.id ? provider.id : ""}</Span></Heading
    >
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <div
    class="grid grid-cols-2 gap-4 py-5 my-2 border-y-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="name" class="block mb-2 {customColorsClassDark.label}"
        >Nombre Completo</Label
      >
      <Input
        id="name"
        class="capitalize {customColorsClassDark.input}"
        bind:value={provider.name}
        required
      />
    </div>
    <div>
      <Label for="email" class="block mb-2 {customColorsClassDark.label}"
        >Email (opcional)</Label
      >
      <Input
        id="email"
        class={customColorsClassDark.input}
        type="email"
        bind:value={provider.email}
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Tipo de documento
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={provider.document_type}
        required
        on:change={() =>
          provider.document_type === 1 ? (provider.document_id = null) : null}
      >
        {#each $documentsTypes as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <div>
      <Label for="document_id" class="block mb-2 {customColorsClassDark.label}"
        >No. Documento</Label
      >
      <Input
        id="document_id"
        class={customColorsClassDark.input}
        placeholder="No. Documento sin guiones"
        bind:value={provider.document_id}
        required={provider.document_type === 1 ? false : true}
        disabled={provider.document_type === 1 ? true : false}
      />
    </div>
    <div>
      <Label for="phone" class="block mb-2 {customColorsClassDark.label}"
        >Teléfono / Celular</Label
      >
      <Input
        id="phone"
        type="number"
        class={customColorsClassDark.input}
        bind:value={provider.phone}
        required
      />
    </div>
    <div>
      <Label for="address" class="block mb-2 {customColorsClassDark.label}"
        >Dirección (opcional)</Label
      >
      <Input
        id="address"
        class={customColorsClassDark.input}
        type="text"
        bind:value={provider.address}
      />
    </div>
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button color="dark" on:click={() => navigateTo("/providers/providers_list")}
    >Volver</Button
  >
  {#if hasPermission("point_of_sales.add_provider") || hasPermission("point_of_sales.change_provider")}
    <Button color="green" type="submit" form="form_provider">Guardar</Button>
  {/if}
</div>
