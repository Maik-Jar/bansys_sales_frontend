<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { hasPermission } from "../../../lib/utils/functions";
  import Item from "./items/Item.svelte";
  import {
    Heading,
    Label,
    Input,
    Textarea,
    Button,
    Span,
  } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const output = Object.seal({
    id: null,
    item: { id: null, name: "", provider: [] },
    quantity: 0.0,
    reason: "",
    departure_date: "",
  });

  let isEditable = false;
  //   let inactivateModal = false;
  let itemsModal = false;
  //   let invoiceNumber = null;

  function getOutput() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.outputsEndPoint +
          `?output_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            output.id = data.id;
            output.item = data.item;
            output.quantity = data.quantity;
            output.reason = data.reason;
            output.departure_date = new Date(
              data.departure_date
            ).toLocaleString("es-DO");
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createOutput() {
    Swal.fire({
      title: "¿Quieres crear una nueva salida?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.outputsEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(output),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              output.id = data.id;
              output.departure_date = new Date(
                data.departure_date
              ).toLocaleString("es-DO");
              Swal.fire("¡Nueva salida registrada!", "", "success");
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

  function updateOutput() {
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
          urls.backendRoute + urls.outputsEndPoint + `?output_id=${output.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(output),
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
    getOutput();
  });
</script>

<form
  id="form_output"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateOutput
    : createOutput}
>
  <div
    class="flex justify-between pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class={customColorsClassDark.label}
      >Salida No.: <Span highlight>{output.id ? output.id : ""}</Span></Heading
    >
    <!-- TODO: PARA LA VERSION 2.1 BUSCAR ORDEN -->
    <Heading tag="h4" class="{customColorsClassDark.label} text-end">
      {#if !output.item.id}
        <Button
          color="blue"
          type="button"
          size="sm"
          on:click={() => (itemsModal = true)}>Seleccionar Item</Button
        >
      {/if}
    </Heading>
  </div>
  <Heading tag="h3" class={customColorsClassDark.label}
    >Información General</Heading
  >
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
        value={output.item.name.toUpperCase()}
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
        bind:value={output.quantity}
        required
      />
    </div>
    <div>
      <Label for="reason" class="mb-2 {customColorsClassDark.label}"
        >Razón de salida</Label
      >
      <Textarea
        class="uppercase {customColorsClassDark.input}"
        id="reason"
        rows="4"
        name="reason"
        bind:value={output.reason}
      />
    </div>
    <div>
      <Label for="departure_date" class="mb-2 {customColorsClassDark.label}"
        >Fecha de entrada</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="departure_date"
        bind:value={output.departure_date}
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
  <Button color="dark" on:click={() => navigateTo("/inventory/outputs_list")}
    >Volver</Button
  >
  {#if hasPermission("inventory.change_output")}
    <Button
      color="green"
      type="submit"
      form="form_output"
      disabled={!output.item}>Guardar</Button
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

<Item bind:item={output.item} bind:openItemModal={itemsModal} />
