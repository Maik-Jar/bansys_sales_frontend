<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { providers, items } from "../../lib/stores/stores";
  import { hasPermission } from "../../lib/utils/functions";
  import {
    Heading,
    Span,
    Label,
    Input,
    Select,
    MultiSelect,
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
    discount: 0.0,
    stock: 0,
    stock_min: 0,
    stock_max: 0,
    is_service: false,
    provider: [],
    status: true,
  });

  let isEditable = false;
  let providersList = $providers.map((e) => {
    return {
      value: e.id,
      name: e.name,
    };
  });

  function updateItemsList() {
    fetch(urls.backendRoute + urls.itemsListEndPoint).then(async (res) => {
      const items_list = await res.json();
      items.set(items_list);
    });
  }

  function getItem() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.itemsEndPoint +
          `?item_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
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
            item.discount = data.discount;
            item.stock = data.stock;
            item.stock_min = data.stock_min;
            item.stock_max = data.stock_max;
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
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(itemToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              item.id = data.id;
              Swal.fire("¡Nuevo item creado!", "", "success");
              updateItemsList();
              isEditable = true;
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
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(itemToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              Swal.fire("¡Datos guardados!", "", "success");
              updateItemsList();
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
      <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
        >Código: <Span highlight>{item.id ? item.id : ""}</Span></Heading
      >
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
    <div>
      <Label for="discount" class="block mb-2 {customColorsClassDark.label}"
        >Descuento</Label
      >
      <ButtonGroup class="w-full">
        <InputAddon>$</InputAddon>
        <Input
          id="discount"
          step="any"
          class={customColorsClassDark.input}
          type="number"
          bind:value={item.discount}
          required
        />
      </ButtonGroup>
    </div>
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
    <div>
      <Label for="stock_min" class="block mb-2 {customColorsClassDark.label}"
        >Stock Minimo</Label
      >
      <Input
        id="stock_min"
        type="number"
        class={customColorsClassDark.input}
        bind:value={item.stock_min}
      />
    </div>
    <div>
      <Label for="stock_max" class="block mb-2 {customColorsClassDark.label}"
        >Stock Maximo</Label
      >
      <Input
        id="stock_max"
        type="number"
        class={customColorsClassDark.input}
        bind:value={item.stock_max}
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Proveedores
      <MultiSelect
        class="mt-2 {customColorsClassDark.input}"
        dropdownClass="max-h-40 {customColorsClassDark.input}"
        items={providersList}
        bind:value={item.provider}
        required
      ></MultiSelect>
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
  <Button
    color="dark"
    on:click={() => navigateTo("products_and_services/items_list")}
    >Volver</Button
  >
  {#if hasPermission("point_of_sales.add_item") || hasPermission("point_of_sales.change_item")}
    <Button color="green" type="submit" form="form_item">Guardar</Button>
  {/if}
</div>
