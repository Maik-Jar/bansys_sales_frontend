<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { receipt, salesTypes } from "../../lib/stores/stores";
  import InvoiceDetailsForm from "./invoice_details/InvoiceDetailsForm.svelte";
  import Customer from "./customer/Customer.svelte";
  import Payment from "./payment/Payment.svelte";
  import { hasPermission } from "../../lib/utils/functions";
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
    Span,
    Dropdown,
    DropdownItem,
  } from "flowbite-svelte";
  import { ChevronDownSolid } from "flowbite-svelte-icons";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };
  const invoiceHeader = Object.seal({
    id: null,
    number: null,
    receipt: Object.seal({ id: 1 }),
    receipt_sequence: null,
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
  let change = 0;
  let totalAmount = 0;
  let totalPayments = 0;
  let getCustomerForIdonChild;
  let addInvoiceDetailsAtSelectedItem;

  $: activeInvoiceDetails = customer?.id ? true : false;

  function getInvoice() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.invoicesEndPoint +
          `?invoice_header_id=${currentRoute.namedParams.id}`,
        {
          headers: {
            Authorization: `Token ${token.token}`,
          },
        }
      )
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            //customer
            customer.id = await data.customer?.id;
            customer.name = data.customer?.name;
            //invoice_details
            invoiceDetails = await data.invoice_detail;
            console.log(Number.parseFloat(invoiceDetails[0]?.discount));
            //payments
            payments = data.payment;
            //invoice_header
            invoiceHeader.id = data.id;
            invoiceHeader.number = data.number;
            // invoiceHeader.receipt = data.receipt;
            invoiceHeader.receipt_sequence = data.receipt_sequence;
            invoiceHeader.discount = data.discount;
            invoiceHeader.sales_type = data.sales_type;
            invoiceHeader.comment = data.comment;
            invoiceHeader.date_created = new Date(
              data.date_created
            ).toLocaleString("es-DO");
            invoiceHeader.date_updated = new Date(
              data.date_updated
            ).toLocaleString("es-DO");
            invoiceHeader.user_created = data.user_created;
            invoiceHeader.user_updated = data.user_updated;
            invoiceHeader.status = data.status;

            getCustomerForIdonChild();
            calculateChange();
            addInvoiceDetailsAtSelectedItem(invoiceDetails);
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
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(invoiceToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              invoiceHeader.id = data.id;
              invoiceHeader.number = data.number;
              invoiceHeader.receipt_sequence = data.receipt_sequence;
              invoiceHeader.date_created = new Date(
                data.date_created
              ).toLocaleString("es-DO");
              invoiceHeader.date_updated = new Date(
                data.date_updated
              ).toLocaleString("es-DO");
              invoiceHeader.user_created = data.user_created;

              Swal.fire("¡Nueva factura creada!", "", "success");
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

  function updateInvoice() {
    let invoiceToSave = {
      ...invoiceHeader,
      invoice_detail: invoiceDetails,
      customer: customer,
      invoice_detail_to_delete: invoiceDetailsToDelete,
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
            `?invoice_header_id=${invoiceHeader.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
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

  function inactivateInvoice() {
    Swal.fire({
      title: "¿Esta seguro que desea inactivar esta factura?",
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
            `?invoice_header_id=${invoiceHeader.id}`,
          {
            method: "delete",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
          }
        )
          .then(async (res) => {
            if (res.ok) {
              invoiceHeader.status = false;
              Swal.fire("¡Factura inactivada!", "", "success");
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

  function calculateChange() {
    change = totalPayments - totalAmount;

    // if (change < 0) {
    //   change = 0;
    // }
  }

  function validateCustomer() {
    if (!customer.id) {
      Swal.fire(
        "Escoga el cliente al que se le realizará la factura.",
        "",
        "warning"
      );
      return false;
    }
    return true;
  }

  function validateDetails() {
    if (!(invoiceDetails.length > 0)) {
      Swal.fire("Inserte al menos un item para facturar.", "", "warning");
      return false;
    }
    return true;
  }

  function validatePayments() {
    if (
      invoiceHeader.sales_type === 1 &&
      !(Number(totalPayments.toFixed(2)) >= Number(totalAmount.toFixed(2)))
    ) {
      Swal.fire(
        "Venta al contado",
        "El total pagado debe ser igual o mayor que el monto a pagar.",
        "warning"
      );
      return false;
    }
    return true;
  }

  function validations(callback) {
    const allValidations = {
      customer: validateCustomer,
      invoiceDetails: validateDetails,
      payments: validatePayments,
    };

    let isValid = false;

    for (let key of Object.values(allValidations)) {
      isValid = key();
      if (!isValid) {
        return;
      }
    }

    callback();
  }

  function printInvoice(invoiceID) {
    if (invoiceHeader.status) {
      window.open(
        urls.backendRoute +
          urls.printInvoiceEndpoint +
          `?invoice_header_id=${invoiceID}&papel_size="A4"`,
        "_blank"
      );
    }
  }

  function printInvoice60mm(invoiceID) {
    if (invoiceHeader.status) {
      window.open(
        urls.backendRoute +
          urls.printInvoice60mmEndpoint +
          `?invoice_header_id=${invoiceID}&papel_size="60mm"`,
        "_blank"
      );
    }
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
    ? () => validations(updateInvoice)
    : () => validations(createInvoice)}
>
  <div
    class="flex justify-between items-center pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >No. Factura: <Span highlight
        >{invoiceHeader.number ? invoiceHeader.number : ""}</Span
      ></Heading
    >

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
          bind:value={invoiceHeader.date_updated}
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
      <Customer
        bind:customer
        bind:getCustomerForId={getCustomerForIdonChild}
        invoiceActive={invoiceHeader.status}
      />
    </div>
    <Heading tag="h5" class=" {customColorsClassDark.label}"
      >Estatus factura: <Badge
        large
        color={invoiceHeader.status ? "green" : "red"}
        >{invoiceHeader.status ? "Activo" : "Inactivo"}</Badge
      ></Heading
    >

    <Label class={customColorsClassDark.label}
      >Tipo de comprobante
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={invoiceHeader.receipt.id}
        required={!isEditable}
        disabled={isEditable}
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
              {response.find((e) => e.id === invoiceHeader.receipt.id)?.serial}
            {/await}
          </InputAddon>
          <Input
            id="receiptSequence"
            class={customColorsClassDark.input}
            value={invoiceHeader.receipt_sequence?.sequence}
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
          type="text"
          class={customColorsClassDark.input}
          value={$receipt.find((e) => e.id === invoiceHeader.receipt.id)
            ?.expiration}
          readonly
        />
      </div>
    </div>
  </div>
  <InvoiceDetailsForm
    bind:invoiceDetails
    bind:invoiceDetailsToDelete
    bind:totalAmount
    bind:addInvoiceDetailsAtSelectedItem
    bind:invoiceHeaderDiscont={invoiceHeader.discount}
    invoiceActive={invoiceHeader.status}
    {activeInvoiceDetails}
    {calculateChange}
  />
  <div class="grid grid-cols-4 gap-4">
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
        disabled={!invoiceHeader.status}
      />
    </div>
    <div class="col-start-3">
      <Label for="price" class="mb-2 {customColorsClassDark.label}"
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
          required={invoiceHeader.status}
          disabled={!invoiceHeader.status}
        />
      </ButtonGroup>
    </div>
    <Label class="{customColorsClassDark.label} col-start-3"
      >Tipo de venta
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={invoiceHeader.sales_type}
        required={invoiceHeader.status}
        disabled={!invoiceHeader.status}
      >
        {#each $salesTypes as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </Select>
    </Label>
    <div class="col-start-3 text-center">
      <Heading tag="h3" class=" {customColorsClassDark.label}"
        >Cambio: <Span highlight
          >{Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
          }).format(change)}</Span
        ></Heading
      >
    </div>
    <Payment
      bind:payments
      bind:totalPayments
      {calculateChange}
      {invoiceDetails}
      {invoiceHeader}
    />
  </div>
</form>
<div class="flex space-x-3 mt-5">
  <Button color="dark" on:click={() => navigateTo("/invoices_manager")}
    >Volver</Button
  >
  {#if hasPermission("point_of_sales.add_invoiceheader") || hasPermission("point_of_sales.change_invoiceheader")}
    <Button
      color="green"
      type="submit"
      form="form_invoice"
      disabled={!invoiceHeader.status}>Guardar</Button
    >
  {/if}
  {#if hasPermission("point_of_sales.delete_invoiceheader")}
    <Button
      color="red"
      type="button"
      on:click={inactivateInvoice}
      disabled={!invoiceHeader.status || !invoiceHeader.id}>Inactivar</Button
    >
  {/if}
  <Button
    color="blue"
    type="button"
    disabled={!invoiceHeader.status || !invoiceHeader.id}
    >Imprimir<ChevronDownSolid
      class="w-3 h-3 ms-2 text-white dark:text-white"
    /></Button
  >
  <Dropdown>
    <DropdownItem on:click={() => printInvoice(invoiceHeader.id)}
      >A4</DropdownItem
    >
    <DropdownItem on:click={() => printInvoice60mm(invoiceHeader.id)}
      >60mm</DropdownItem
    >
  </Dropdown>
</div>
