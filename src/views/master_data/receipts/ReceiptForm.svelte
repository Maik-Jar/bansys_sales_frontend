<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { taxes } from "../../../lib/stores/stores";
  import { hasPermission } from "../../../lib/utils/functions";
  import { Heading, Label, Input, Select, Button, Span } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const receipt = Object.seal({
    id: null,
    name: null,
    serial: "",
    init: 1,
    end: 0,
    expiration: "",
    tax: 1,
    status: true,
  });

  let isEditable = false;

  function validEnd() {
    receipt.end = receipt.end < receipt.init ? receipt.init + 1 : receipt.end;
  }

  function getReceipt() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.receiptEndPoint +
          `?receipt_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            receipt.id = data.id;
            receipt.name = data.name;
            receipt.serial = data.serial;
            receipt.init = data.init;
            receipt.end = data.end;
            receipt.expiration = data.expiration;
            receipt.tax = data.tax;
            receipt.status = data.status;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createReceipt() {
    validEnd();
    Swal.fire({
      title: "¿Quieres crear este nuevo comprobante?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.receiptEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(receipt),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              receipt.id = data.id;

              Swal.fire("¡Nuevo comprobante creado!", "", "success");
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

  function updateReceipt() {
    validEnd();
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
            urls.receiptEndPoint +
            `?receipt_id=${receipt.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(receipt),
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
    getReceipt();
  });
</script>

<form
  id="form_receipt"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateReceipt
    : createReceipt}
>
  <div
    class="flex justify-start pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >Código: <Span highlight>{receipt.id ? receipt.id : ""}</Span></Heading
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
        bind:value={receipt.name}
        required
      />
    </div>
    <div>
      <Label for="serial" class="block mb-2 {customColorsClassDark.label}"
        >Serial</Label
      >
      <Input
        id="serial"
        class="capitalize {customColorsClassDark.input}"
        bind:value={receipt.serial}
        required
      />
    </div>
    <div>
      <Label for="init" class="block mb-2 {customColorsClassDark.label}"
        >Inicio</Label
      >
      <Input
        id="init"
        type="number"
        class="capitalize {customColorsClassDark.input}"
        bind:value={receipt.init}
        required
      />
    </div>
    <div>
      <Label for="end" class="block mb-2 {customColorsClassDark.label}"
        >Fin</Label
      >
      <Input
        id="end"
        type="number"
        class="capitalize {customColorsClassDark.input}"
        bind:value={receipt.end}
        required
      />
    </div>
    <div>
      <Label for="expiration" class="block mb-2 {customColorsClassDark.label}"
        >Vigencia</Label
      >
      <Input
        id="expiration"
        type="date"
        class={customColorsClassDark.input}
        bind:value={receipt.expiration}
        required
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Impuesto
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={receipt.tax}
        required
      >
        {#each $taxes as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <Label class={customColorsClassDark.label}
      >Status
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={receipt.status}
        required
      >
        <option value={true}>Activo</option>
        <option value={false}>Inactivo</option>
      </Select>
    </Label>
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button color="dark" on:click={() => navigateTo("master_data/receipts_list")}
    >Volver</Button
  >
  {#if hasPermission("master_data.add_receipt") || hasPermission("master_data.change_receipt")}
    <Button color="green" type="submit" form="form_receipt">Guardar</Button>
  {/if}
</div>
