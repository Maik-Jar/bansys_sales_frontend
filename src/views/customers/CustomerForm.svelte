<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { documentsTypes } from "../../lib/stores/stores";
  import { Heading, Label, Input, Select, Button } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const customer = Object.seal({
    id: null,
    name: null,
    document_type: 1,
    document_id: null,
    phone: null,
    address: null,
    email: null,
  });

  let isEditable = false;

  function getCustomer() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.customersEndPoint +
          `?customer_id=${currentRoute.namedParams.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            customer.id = data.id;
            customer.name = data.name;
            customer.document_type = data.document_type;
            customer.document_id = data.document_id;
            customer.phone = data.phone;
            customer.address = data.address;
            customer.email = data.email;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createCustomer() {
    let customerToSave = { ...customer };
    Swal.fire({
      title: "¿Quieres crear este nuevo cliente?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.customersEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(customerToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              customer.id = data.id;

              Swal.fire("¡Nuevo cliente creado!", "", "success");
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

  function updateCustomer() {
    let customerToSave = { ...customer };
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
            urls.customersEndPoint +
            `?customer_id=${customer.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify(customerToSave),
          }
        )
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
    getCustomer();
  });
</script>

<form
  id="form_customer"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateCustomer
    : createCustomer}
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
        bind:value={customer.id}
        readonly
      />
    </div>
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
        bind:value={customer.name}
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
        bind:value={customer.email}
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Tipo de documento
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={customer.document_type}
        required
        on:change={() =>
          customer.document_type === 1 ? (customer.document_id = null) : null}
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
        bind:value={customer.document_id}
        required={customer.document_type === 1 ? false : true}
        disabled={customer.document_type === 1 ? true : false}
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
        bind:value={customer.phone}
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
        bind:value={customer.address}
      />
    </div>
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button color="dark" on:click={() => navigateTo("/customers_manager")}
    >Volver</Button
  >
  <Button color="green" type="submit" form="form_customer">Guardar</Button>
</div>
