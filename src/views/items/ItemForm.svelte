<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { providers, taxes } from "../../lib/stores/stores";
  import {
    Heading,
    Label,
    Input,
    Select,
    Button,
    InputAddon,
    ButtonGroup,
    Toggle,
  } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const item = Object.seal({
    id: null,
    name: null,
    brand: null,
    reference: null,
    price: 0.0,
    tax: null,
    stock: 0,
    is_service: false,
    provider: null,
    status: true,
  });

  let isEditable = false;

  function getItem() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.itemsEndPoint +
          `?item_id=${currentRoute.namedParams.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            item.id = data.id;
            item.name = data.name;
            item.brand = data.brand;
            item.reference = data.reference;
            item.price = data.price;
            item.tax = data.tax;
            item.stock = data.stock;
            item.is_service = data.is_service;
            item.provider = data.provider;
            item.status = data.status;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createItem() {
    let itemToSave = { ...item };
    Swal.fire({
      title: "¿Quieres crear este nuevo item?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.itemsEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(itemToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              item.id = data.id;

              Swal.fire("¡Nuevo item creado!", "", "success");
              isEditable = true;
            } else {
              Swal.fire("Solicitud incorrecta.", "", "error");
              console.log(await res.json());
            }
          })
          .catch((error) => {
            Swal.fire(`${error.message}`, "", "error");
            console.log(error.message);
          });
      } else if (result.isDenied) {
        Swal.fire("Operación descartada.", "", "info");
      }
    });
  }

  function updateItem() {
    let itemToSave = { ...item };
    Swal.fire({
      title: "¿Quieres guardar los datos?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.itemsEndPoint + `?item_id=${item.id}`, {
          method: "put",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(itemToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              Swal.fire("¡Datos guardados!", "", "success");
            } else {
              Swal.fire("Solicitud incorrecta.", "", "error");
              console.log(await res.json());
            }
          })
          .catch((error) => {
            Swal.fire(`${error.message}`, "", "error");
          });
      } else if (result.isDenied) {
        Swal.fire("Operación descartada.", "", "info");
      }
    });
  }

  onMount(async () => {
    isEditable = (await currentRoute.namedParams.id) ? true : false;
    getItem();
  });
</script>

<form
  id="form_item"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateItem
    : createItem}
>
  <div
    class="flex justify-start pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="code" class="block mb-2 {customColorsClassDark.label}"
        >Código</Label
      >
      <Input
        id="code"
        class="w-[50%] text-center {customColorsClassDark.input}"
        bind:value={item.id}
        readonly
      />
    </div>
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <div
    class="grid grid-cols-2 gap-4 py-5 my-2 border-y-4 border-gray-100 dark:border-gray-400"
  >
    <div class="col-span-2">
      <Toggle
        color="orange"
        bind:checked={item.is_service}
        class="{customColorsClassDark.label}  ">Servicio</Toggle
      >
    </div>
    <div>
      <Label for="name" class="block mb-2 {customColorsClassDark.label}"
        >Nombre</Label
      >
      <Input
        id="name"
        class="capitalize {customColorsClassDark.input}"
        bind:value={item.name}
        required
      />
    </div>

    <div>
      <Label for="brand" class="block mb-2 {customColorsClassDark.label}"
        >Marca (opcional)</Label
      >
      <Input
        id="brand"
        class={customColorsClassDark.input}
        type="text"
        bind:value={item.brand}
      />
    </div>
    <div>
      <Label for="reference" class="block mb-2 {customColorsClassDark.label}"
        >Referencia (opcional)</Label
      >

      <Input
        id="reference"
        class={customColorsClassDark.input}
        type="text"
        bind:value={item.reference}
      />
    </div>
    <div>
      <Label for="price" class="block mb-2 {customColorsClassDark.label}"
        >Precio</Label
      >
      <ButtonGroup class="w-full">
        <InputAddon>$</InputAddon>
        <Input
          id="price"
          class={customColorsClassDark.input}
          type="number"
          bind:value={item.price}
          required
        />
      </ButtonGroup>
    </div>
    <Label class={customColorsClassDark.label}
      >Impuesto
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={item.tax}
        required
      >
        {#each $taxes as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <div>
      <Label for="stock" class="block mb-2 {customColorsClassDark.label}"
        >Stock</Label
      >
      <Input
        id="stock"
        type="number"
        class={customColorsClassDark.input}
        bind:value={item.stock}
        readonly
      />
    </div>
    <Label class={customColorsClassDark.label}
      >proveedor
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={item.provider}
        required
      >
        {#each $providers as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <Label class={customColorsClassDark.label}
      >Estatus
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={item.status}
        required
      >
        <option value={true}>Activo</option>
        <option value={false}>Inactivo</option>
      </Select>
    </Label>
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button color="dark" on:click={() => navigateTo("/items_manager")}
    >Volver</Button
  >
  <Button color="green" type="submit" form="form_item">Guardar</Button>
</div>
