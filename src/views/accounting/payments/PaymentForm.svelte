<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { paymentMethods } from "../../../lib/stores/stores";
  import { hasPermission } from "../../../lib/utils/functions";
  import Invoice from "./invoices/Invoice.svelte";
  import {
    Heading,
    Label,
    Input,
    Select,
    Button,
    Span,
    InputAddon,
    ButtonGroup,
    Badge,
    Textarea,
    Modal,
  } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  const payment = Object.seal({
    id: null,
    invoice: null,
    payment_method: 1,
    amount: 0.0,
    user_created: { first_name: "", last_name: "" },
    user_updated: { first_name: "", last_name: "" },
    date_created: "",
    date_updated: "",
    status: true,
    inactive_comment: "",
  });

  let isEditable = false;
  let inactivateModal = false;
  let invoiceModal = false;
  let invoiceNumber = null;
  $: console.log(isEditable);

  function getPayment() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.paymentsEndPoint +
          `?payment_id=${currentRoute.queryParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            payment.id = data.id;
            payment.invoice = data.invoice;
            payment.amount = data.amount;
            payment.payment_method = data.payment_method;
            payment.user_created = data.user_created;
            payment.user_updated = data.user_updated;
            payment.date_created = new Date(data.date_created).toLocaleString(
              "es-DO"
            );
            payment.date_updated = new Date(data.date_updated).toLocaleString(
              "es-DO"
            );
            payment.status = data.status;
            payment.inactive_comment = data.inactive_comment;
            invoiceNumber = data.invoice_number;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createPayment() {
    Swal.fire({
      title: "¿Quieres aplicar este nuevo pago?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.paymentsEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(payment),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              payment.id = data.id;
              payment.user_created = data.user_created;
              payment.user_updated = data.user_updated;
              payment.date_created = new Date(data.date_created).toLocaleString(
                "es-DO"
              );
              payment.date_updated = new Date(data.date_updated).toLocaleString(
                "es-DO"
              );
              Swal.fire("¡Nuevo pago aplicado!", "", "success");
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

  function updatePayment() {
    if (payment.status) {
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
              urls.paymentsEndPoint +
              `?payment_id=${payment.id}`,
            {
              method: "put",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Token ${token.token}`,
              },
              body: JSON.stringify(payment),
            }
          )
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                payment.user_updated = data.user_updated;
                payment.date_updated = new Date(
                  data.date_updated
                ).toLocaleString("es-DO");
                Swal.fire("¡Datos guardados!", "", "success");
              } else {
                const message = await res.json();
                Swal.fire(
                  "Solicitud incorrecta.",
                  `${message.detail}`,
                  "error"
                );
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
  }

  function inactivatePayment() {
    Swal.fire({
      title: "¿Esta seguro que desea inactivar este pago?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(
          urls.backendRoute +
            urls.paymentsEndPoint +
            `?payment_id=${payment.id}`,
          {
            method: "delete",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify({
              inactivate_comment: payment.inactive_comment,
            }),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              payment.status = false;
              inactivateModal = false;
              Swal.fire("¡pago inactivado!", "", "success");
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

  function printInvoicePayment(paymentID) {
    if (payment.status) {
      window.open(
        urls.backendRoute +
          urls.printPaymentInvoice +
          `?payment_id=${paymentID}&papel_size="60mm"`,
        "_blank"
      );
    }
  }

  onMount(async () => {
    isEditable =
      (await currentRoute.queryParams.type) == "update" ? true : false;
    getPayment();
  });
</script>

<form
  id="form_payment"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updatePayment
    : createPayment}
>
  <div
    class="flex justify-between pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class={customColorsClassDark.label}
      >Pago No.: <Span highlight>{payment.id ? payment.id : ""}</Span></Heading
    >
    <Heading tag="h4" class="{customColorsClassDark.label} text-end"
      >Factura No.:
      {#if payment.invoice}
        <Span highlight>{invoiceNumber ? invoiceNumber : ""}</Span>
      {:else}
        <Button
          color="blue"
          type="button"
          disabled={!payment.status}
          size="sm"
          on:click={() => (invoiceModal = true)}>Seleccionar factura</Button
        >
      {/if}
    </Heading>
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <div class="pt-5 mt-2 border-t-4 border-gray-100 dark:border-gray-400">
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >Estatus: {#if payment.status}<Badge color="green">Activo</Badge
        >{:else}<Badge color="red" large>Inactivo</Badge>{/if}
    </Heading>
  </div>
  <div
    class="grid grid-cols-2 gap-4 py-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="user_created" class="mb-2 {customColorsClassDark.label}"
        >Creado por</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="user_created"
        value="{payment.user_created?.first_name}{payment.user_created
          ?.last_name}"
        readonly
      />
    </div>
    <div>
      <Label for="date_created" class="mb-2 {customColorsClassDark.label}"
        >Fecha de creación</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="date_created"
        value={payment.date_created}
        readonly
      />
    </div>
    <div>
      <Label for="user_updated" class="mb-2 {customColorsClassDark.label}"
        >Modificado por</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="user_updated"
        value="{payment.user_updated?.first_name}{payment.user_updated
          ?.last_name}"
        readonly
      />
    </div>
    <div>
      <Label for="date_updated" class="mb-2 {customColorsClassDark.label}"
        >Fecha Ult. Modificación</Label
      >
      <Input
        class="uppercase {customColorsClassDark.input}"
        type="text"
        id="date_updated"
        value={payment.date_updated}
        readonly
      />
    </div>
    <div>
      <Label class="mb-2 {customColorsClassDark.label}" for="amount"
        >Monto</Label
      >
      <ButtonGroup class="w-full">
        <InputAddon>DOP$</InputAddon>
        <Input
          class={customColorsClassDark.input}
          id="amount"
          type="number"
          bind:value={payment.amount}
          disabled={!payment.status || !payment.invoice}
          required
        />
      </ButtonGroup>
    </div>
    <Label class={customColorsClassDark.label}
      >Método de pago
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={payment.payment_method}
        disabled={!payment.status || !payment.invoice}
        required
      >
        {#each $paymentMethods as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    {#if !payment.status}
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
          value={payment.inactive_comment}
        />
      </div>
    {/if}
  </div>
</form>
<div class="flex space-x-3 mt-3">
  <Button
    color="dark"
    on:click={() => navigateTo("/accounts_receivable/payments_list")}
    >Volver</Button
  >
  {#if hasPermission("accounting.change_payment")}
    <Button
      color="green"
      type="submit"
      form="form_payment"
      disabled={!payment.status || !payment.invoice}>Guardar</Button
    >
    <Button
      color="red"
      disabled={!payment.status || !payment.id}
      on:click={() => (inactivateModal = true)}>Inactivar</Button
    >
  {/if}
  <Button
    color="blue"
    type="button"
    disabled={!payment.status || !payment.id}
    on:click={() => printInvoicePayment(payment.id)}>Imprimir</Button
  >
</div>

<Modal bind:open={inactivateModal} size="xs" autoclose={false} class="w-full">
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
      bind:value={payment.inactive_comment}
    />
    <Button
      type="submit"
      color="green"
      form="form_inactivate"
      disabled={!payment.inactive_comment ||
        payment.inactive_comment.length < 15}>Confirmar</Button
    >
  </form>
</Modal>

<Invoice
  bind:invoice={payment.invoice}
  bind:invoiceNumber
  bind:openInvoiceModal={invoiceModal}
/>
