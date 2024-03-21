<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { providers } from "../../../lib/stores/stores";
  import { hasPermission } from "../../../lib/utils/functions";
  import Item from "./items/Item.svelte";
  import { Heading, Label, Input, Select, Button, Span } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const input = Object.seal({
    id: null,
    item: { id: null, name: "", provider: [] },
    provider: 1,
    quantity: 0.0,
    invoice_number: "",
    purchase_order: "",
    date_of_entry: "",
  });

  let isEditable = false;
  //   let inactivateModal = false;
  let itemsModal = false;
  //   let invoiceNumber = null;

  function getInput() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.inputsEndPoint +
          `?input_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            input.id = data.id;
            input.item = data.item;
            input.quantity = data.quantity;
            input.provider = data.provider;
            input.invoice_number = data.invoice_number;
            input.purchase_order = data.purchase_order;
            input.date_of_entry = new Date(data.date_of_entry).toLocaleString(
              "es-DO"
            );
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createInput() {
    Swal.fire({
      title: "¿Quieres crear una nueva entrada?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.inputsEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(input),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              input.id = data.id;
              input.date_of_entry = new Date(data.date_of_entry).toLocaleString(
                "es-DO"
              );
              Swal.fire("¡Nueva entrada registrada!", "", "success");
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

  function updateInput() {
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
          urls.backendRoute + urls.inputsEndPoint + `?input_id=${input.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(input),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              // const data = await res.json();
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
  //TODO: PARA LA VERSION 2.1 INACTIVAR ENTRADA
  //   function inactivatePayment() {
  //     Swal.fire({
  //       title: "¿Esta seguro que desea inactivar este pago?",
  //       showDenyButton: true,
  //       showCancelButton: true,
  //       confirmButtonText: "Si",
  //       denyButtonText: `¡No, Descartalo!`,
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         const token = JSON.parse(localStorage.getItem("token"));
  //         fetch(
  //           urls.backendRoute +
  //             urls.paymentsEndPoint +
  //             `?payment_id=${input.id}`,
  //           {
  //             method: "delete",
  //             headers: {
  //               Accept: "application/json",
  //               "Content-Type": "application/json",
  //               Authorization: `Token ${token.token}`,
  //             },
  //             body: JSON.stringify({
  //               inactivate_comment: input.inactive_comment,
  //             }),
  //           }
  //         )
  //           .then(async (res) => {
  //             if (res.ok) {
  //               input.status = false;
  //               inactivateModal = false;
  //               Swal.fire("¡pago inactivado!", "", "success");
  //             } else {
  //               const message = await res.json();
  //               Swal.fire("Solicitud incorrecta.", `${message.detail}`, "error");
  //               console.log(message);
  //             }
  //           })
  //           .catch((error) => {
  //             Swal.fire("Error interno", `${error.message}`, "error");
  //           });
  //       } else if (result.isDenied) {
  //         Swal.fire("Operación descartada.", "", "info");
  //       }
  //     });
  //   }

  onMount(async () => {
    isEditable =
      (await currentRoute.queryParams.type) == "update" ? true : false;
    getInput();
  });
</script>

<form
  id="form_input"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateInput
    : createInput}
>
  <div
    class="flex justify-between pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class={customColorsClassDark.label}
      >Entrada No.: <Span highlight>{input.id ? input.id : ""}</Span></Heading
    >
    <!-- TODO: PARA LA VERSION 2.1 BUSCAR ORDEN -->
    <Heading tag="h4" class="{customColorsClassDark.label} text-end">
      {#if !input.item.id}
        <Button
          color="blue"
          type="button"
          size="sm"
          on:click={() => (itemsModal = true)}>Seleccionar Item</Button
        >
      {/if}
    </Heading>
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <!-- <div class="pt-5 mt-2 border-t-4 border-gray-100 dark:border-gray-400">
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >Estatus: {#if input.status}<Badge color="green">Activo</Badge
        >{:else}<Badge color="red" large>Inactivo</Badge>{/if}
    </Heading>
  </div> -->
  <div
    class="grid grid-cols-2 gap-4 py-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="item" class="mb-2 {customColorsClassDark.label}">Item</Label>
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="item"
        value={input.item.name.toUpperCase()}
        readonly
      />
    </div>
    <div>
      <Label for="quantity" class="mb-2 {customColorsClassDark.label}"
        >Cantidad</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="number"
        id="quantity"
        bind:value={input.quantity}
        required
      />
    </div>
    <Label class={customColorsClassDark.label}
      >Proveedor
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={input.provider}
        disabled={!input.item.id}
        required
      >
        {#each $providers.filter( (e) => input.item.provider.includes(e.id) ) as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <div>
      <Label for="purchase_order" class="mb-2 {customColorsClassDark.label}"
        >Orden No.</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="purchase_order"
        bind:value={input.purchase_order}
      />
    </div>
    <div>
      <Label for="invoice_number" class="mb-2 {customColorsClassDark.label}"
        >Fact. No.</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="invoice_number"
        bind:value={input.invoice_number}
      />
    </div>
    <div>
      <Label for="date_of_entry" class="mb-2 {customColorsClassDark.label}"
        >Fecha de entrada</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="date_of_entry"
        bind:value={input.date_of_entry}
        readonly
      />
    </div>

    <!-- {#if !input.status}
      <div>
        <Label
          for="inactivate_comment"
          class="mb-2 {customColorsClassDark.label}"
          >Motivo de inactivación</Label
        >
        <Textarea
          class={customColorsClassDark.input}
          id="inactivate_comment"
          rows="4"
          name="message"
          value={input.inactive_comment}
        />
      </div>
    {/if} -->
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button color="dark" on:click={() => navigateTo("/inventory/inputs_list")}
    >Volver</Button
  >
  {#if hasPermission("inventory.change_input")}
    <Button color="green" type="submit" form="form_input" disabled={!input.item}
      >Guardar</Button
    >
    <!-- <Button
      color="red"
      disabled={!input.status || !input.id}
      on:click={() => (inactivateModal = true)}>Inactivar</Button
    > -->
  {/if}
  <!-- <Button
    color="blue"
    type="button"
    disabled={!input.status || !input.id}
    on:click={() => printInvoicePayment(input.id)}>Imprimir</Button
  > -->
</div>

<!-- <Modal bind:open={inactivateModal} size="xs" autoclose={false} class="w-full">
  <form
    id="form_inactivate"
    class="flex flex-col space-y-6"
    on:submit|preventDefault|stopPropagation={inactivatePayment}
  >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
      Motivo de inactivación
    </h3>
    <Label for="inactivate_comment" class="mb-2">
      Especifique el motivo por el cual inactiva el pago.</Label
    >
    <Textarea
      class="uppercase {customColorsClassDark.input}"
      id="inactivate_comment"
      rows="4"
      name="message"
      bind:value={input.inactive_comment}
    />
    <Button
      type="submit"
      color="green"
      form="form_inactivate"
      disabled={!input.inactive_comment ||
        input.inactive_comment.length < 15}>Confirmar</Button
    >
  </form>
</Modal> -->

<Item
  bind:item={input.item}
  bind:openItemModal={itemsModal}
  bind:inputProvider={input.provider}
/>
