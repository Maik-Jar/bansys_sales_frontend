<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { receipt, salesTypes, paymentMethods } from "../../lib/stores/stores";
  import InvoiceDetailsForm from "./invoice_details/InvoiceDetailsForm.svelte";
  import Customer from "./customer/Customer.svelte";
  import {
    Heading,
    Label,
    Input,
    Select,
    Button,
    InputAddon,
    ButtonGroup,
    Textarea,
    Badge,
  } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };
  const invoiceHeader = Object.seal({
    id: null,
    number: null,
    receipt_type: 1,
    sequence_receipt: null,
    discount: 0.0,
    sales_type: 1,
    comment: null,
    date_created: null,
    date_updated: null,
    user_created: null,
    user_updated: null,
    status: true,
  });

  let customer = Object.seal({
    id: null,
    name: null,
  });
  let invoiceDetails = [];
  let payments = [];
  let invoiceDetailsToDelete = [];
  let isEditable = false;

  $: activeInvoiceDetails = customer?.id ? true : false;

  function getInvoice() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.invoicesEndPoint +
          `?invoice_id=${currentRoute.namedParams.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            //invoice_header
            invoiceHeader.id = data.id;
            invoiceHeader.number = data.number;
            invoiceHeader.receipt_type = data.receipt_type;
            invoiceHeader.sequence_receipt = data.sequence_receipt;
            invoiceHeader.discount = data.discount;
            invoiceHeader.sales_type = data.sales_type;
            invoiceHeader.comment = data.comment;
            invoiceHeader.date_created = data.date_created;
            invoiceHeader.date_updated = data.date_updated;
            invoiceHeader.user_created = data.user_created;
            invoiceHeader.user_updated = data.user_updated;
            invoiceHeader.status = data.status;
            //customer
            customer.id = data.customer?.id;
            customer.name = data.customer?.name;
            //payment
            payments = data.payment;
            //invoice_details
            invoiceDetails = data.invoice_detail;
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createInvoice() {
    let invoiceToSave = {
      ...invoiceHeader,
      invoice_detail: invoiceDetails,
      customer: customer,
      payment: payments,
    };
    Swal.fire({
      title: "¿Quieres crear esta nueva factura?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.invoicesEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(invoiceToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              invoiceHeader.id = data.id;
              invoiceHeader.number = data.number;
              invoiceHeader.sequence_receipt = data.sequence_receipt;
              invoiceHeader.date_created = data.date_created;
              invoiceHeader.date_updated = data.date_updated;
              invoiceHeader.user_created = data.user_created;

              Swal.fire("¡Nueva factura creada!", "", "success");
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

  function updateInvoice() {
    let invoiceToSave = {
      ...invoiceHeader,
      invoice_detail: invoiceDetails,
      customer: customer,
      payment: payments,
    };
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
            urls.invoicesEndPoint +
            `?invoice_id=${invoiceHeader.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify(invoiceToSave),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              invoiceHeader.date_updated = data.date_updated;
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

  function appliyGeneralDiscount() {
    let discountPerDetail = 0;

    invoiceDetails = invoiceDetails.map((e) => {
      e.discount = 0;
      return e;
    });

    if (invoiceHeader.discount < 0) {
      return;
    }

    discountPerDetail =
      invoiceHeader.discount > 0 && invoiceHeader.discount < 1
        ? invoiceHeader.discount
        : invoiceHeader.discount / invoiceDetails.length;

    invoiceDetails = invoiceDetails.map((e) => {
      e.discount = discountPerDetail;
      return e;
    });
  }

  onMount(async () => {
    isEditable = (await currentRoute.namedParams.id) ? true : false;
    getInvoice();
  });
</script>

<form
  id="form_invoice"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? updateInvoice
    : createInvoice}
>
  <div
    class="flex justify-between pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <div>
      <Label for="numberInv" class="block mb-2 {customColorsClassDark.label}"
        >No. Factura</Label
      >
      <Input
        id="numberInv"
        class="w-[75%] text-center {customColorsClassDark.input}"
        bind:value={invoiceHeader.number}
        readonly
      />
    </div>
    <div class="flex space-x-3">
      <div>
        <Label
          for="dateCreated"
          class="block mb-2 {customColorsClassDark.label}">Fecha Creación</Label
        >
        <Input
          id="dateCreated"
          class="text-center {customColorsClassDark.input}"
          bind:value={invoiceHeader.date_created}
          readonly
        />
      </div>
      <div>
        <Label
          for="dateUpdated"
          class="block mb-2 {customColorsClassDark.label}"
          >Ult. Actualización</Label
        >
        <Input
          id="dateUpdated"
          class="text-center {customColorsClassDark.input}"
          bind:value={invoiceHeader.id}
          readonly
        />
      </div>
    </div>
  </div>
  <Heading tag="h3" class={"dark:text-black"}>Información General</Heading>
  <div
    class="grid grid-cols-2 gap-4 py-5 my-2 border-y-4 border-gray-100 dark:border-gray-400"
  >
    <div
      class="flex flex-col rounded-lg border-2 border-gray-500 row-span-3 shadow-lg p-2"
    >
      <Customer bind:customer />
    </div>
    <Badge large color={invoiceHeader.status ? "green" : "red"}
      >Estatus factura: {invoiceHeader.status ? "Activo" : "Inactivo"}</Badge
    >
    <Label class={customColorsClassDark.label}
      >Tipo de comprobante
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={invoiceHeader.receipt_type}
        required
      >
        {#each $receipt as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <div class="flex space-x-3">
      <div class="w-full">
        <Label for="receiptSequence" class="mb-2 {customColorsClassDark.label}"
          >No. Comprobante</Label
        >
        <ButtonGroup class="w-full">
          <InputAddon>
            {#await $receipt}
              ...
            {:then response}
              {response.find((e) => e.id === invoiceHeader.receipt_type)
                ?.serial}
            {/await}
          </InputAddon>
          <Input
            id="receiptSequence"
            class={customColorsClassDark.input}
            bind:value={invoiceHeader.sequence_receipt}
            readonly
          />
        </ButtonGroup>
      </div>
      <div class="w-full">
        <Label
          for="recepitExpiration"
          class="mb-2 {customColorsClassDark.label}">Fecha de expiración</Label
        >
        <Input
          id="recepitExpiration"
          class={customColorsClassDark.input}
          value={$receipt.find((e) => e.id === invoiceHeader.receipt_type)
            ?.expiration}
          type="text"
        />
      </div>
    </div>
  </div>
  <InvoiceDetailsForm
    bind:invoiceDetails
    bind:invoiceDetailsToDelete
    bind:invoiceHeaderDiscont={invoiceHeader.discount}
    {activeInvoiceDetails}
  />
  <div class="grid grid-cols-4 gap-y-4">
    <div class="col-start-1 row-span-3">
      <Label for="textarea-id" class="mb-2 {customColorsClassDark.label}"
        >Comentarios</Label
      >
      <Textarea
        class={customColorsClassDark.input}
        id="textarea-id"
        rows="9"
        name="message"
        bind:value={invoiceHeader.comment}
      />
    </div>
    <div class="col-start-4">
      <Label for="price" class="block mb-2 {customColorsClassDark.label}"
        >Descuento General</Label
      >
      <ButtonGroup class="w-full">
        <InputAddon>DOP$</InputAddon>
        <Input
          id="price"
          step="any"
          class={customColorsClassDark.input}
          type="number"
          bind:value={invoiceHeader.discount}
          on:blur={appliyGeneralDiscount}
          required
        />
      </ButtonGroup>
    </div>
    <Label class="{customColorsClassDark.label} col-start-4"
      >Tipo de venta
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={invoiceHeader.sales_type}
        required
      >
        {#each $salesTypes as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <Label class="{customColorsClassDark.label} col-start-4"
      >Metodo de pago
      <Select class="mt-2 {customColorsClassDark.input}" required>
        {#each $paymentMethods as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
  </div>
</form>
<div class="flex space-x-3 mt-5">
  <Button color="dark" on:click={() => navigateTo("/invoices_manager")}
    >Volver</Button
  >
  <Button color="green" type="submit" form="form_invoice">Guardar</Button>
</div>
