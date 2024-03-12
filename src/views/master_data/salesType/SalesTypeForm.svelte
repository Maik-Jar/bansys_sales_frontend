<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { hasPermission } from "../../../lib/utils/functions";
  import { Heading, Label, Input, Select, Button, Span } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const salesType = Object.seal({
    id: null,
    name: null,
    status: true,
  });

  let isEditable = false;

  function getSalesType() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.salesTypesEndpoint +
          `?sale_type_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            salesType.id = data.id;
            salesType.name = data.name;
            salesType.status = data.status;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createSalesType() {
    Swal.fire({
      title: "¿Quieres crear este nuevo tipo de venta?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.salesTypesEndpoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(salesType),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              salesType.id = data.id;

              Swal.fire("¡Nuevo tipo de venta creado!", "", "success");
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

  function updateSalesType() {
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
            urls.salesTypesEndpoint +
            `?sale_type_id=${salesType.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(salesType),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              Swal.fire("¡Datos guardados!", "", "success");
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
    getSalesType();
  });
</script>

<form
  id="form_salesType"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateSalesType
    : createSalesType}
>
  <div
    class="flex justify-start pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >Código: <Span highlight>{salesType.id ? salesType.id : ""}</Span
      ></Heading
    >
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <div
    class="grid grid-cols-2 gap-4 py-5 my-2 border-y-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="name" class="block mb-2 {customColorsClassDark.label}"
        >Nombre</Label
      >
      <Input
        id="name"
        class="capitalize {customColorsClassDark.input}"
        bind:value={salesType.name}
        required
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Status
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={salesType.status}
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
    on:click={() => navigateTo("master_data/sales_types_list")}>Volver</Button
  >
  {#if hasPermission("master_data.add_saletype") || hasPermission("master_data.change_saletype")}
    <Button color="green" type="submit" form="form_salesType">Guardar</Button>
  {/if}
</div>
