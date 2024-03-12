<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { salesTypes } from "../../lib/stores/stores";
  import InvoiceDetailsForm from "./invoice_details/InvoiceDetailsForm.svelte";
  import Customer from "./customer/Customer.svelte";
  import Payment from "./payment/Payment.svelte";
  import Receipt from "./receipt/Receipt.svelte";
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
    Modal,
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
    tax: 0.0,
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
  let receiptSequence = {};
  let receipt = {};
  let invoiceDetails = [];
  let payments = [];
  let invoiceDetailsToDelete = [];

  let isEditable = false;
  let pending = 0;
  let subTotal = 0;
  let totalTax = 0;
  let totalDiscoint = 0;
  let totalAmount = 0;
  let totalPayments = 0;
  let getCustomerForIdonChild;
  let addInvoiceDetailsAtSelectedItem;
  let assignReceipt;
  let discountModal = false;
  let paymentsModal = false;

  $: activeInvoiceDetails = customer?.id ? true : false;
  $: if (invoiceDetails) {
    calculateSubtotal();
    calculateDiscount();
    calculateTax();
    calculateTotal();
    calculatePending();
  }
  $: {
    invoiceHeader.discount = invoiceHeader.discount
      ? invoiceHeader.discount
      : 0.0;
    calculateDiscount();
    calculateTax();
    calculateTotal();
    calculatePending();
  }

  function getInvoice() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.invoicesEndPoint +
          `?invoice_header_id=${currentRoute.queryParams.id}`,
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
            customer.id = data.customer?.id;
            customer.name = data.customer?.name;
            //invoice_details
            invoiceDetails = data.invoice_detail;
            //payments
            payments = data.payment;
            //receipt_sequence
            receiptSequence = data.receipt_sequence;
            //invoice_header
            invoiceHeader.id = data.id;
            invoiceHeader.number = data.number;
            invoiceHeader.discount = data.discount;
            invoiceHeader.tax = data.tax;
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
            calculatePending();
            addInvoiceDetailsAtSelectedItem(invoiceDetails);
            assignReceipt(receiptSequence);
            calculatePayments();
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
      receipt: receipt,
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
              receiptSequence = data.receipt_sequence;
              invoiceHeader.date_created = new Date(
                data.date_created
              ).toLocaleString("es-DO");
              invoiceHeader.date_updated = new Date(
                data.date_updated
              ).toLocaleString("es-DO");
              invoiceHeader.user_created = data.user_created;
              invoiceDetails = data?.invoice_detail;

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
      receipt: receipt,
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
              invoiceDetails = data?.invoice_detail;
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

  function calculatePending() {
    pending = 0;
    pending = totalAmount - totalPayments;
    if (pending < 0) {
      pending = 0;
    }
  }

  function calculateSubtotal() {
    subTotal = 0;
    invoiceDetails.map((e) => (subTotal += e.quantity * e.price));
  }

  function calculateDiscount() {
    totalDiscoint = 0;
    if (invoiceHeader.discount < 0 || invoiceHeader.discount == 0) {
      return totalDiscoint;
    }
    // prettier-ignore
    if (!Number.isInteger(invoiceHeader.discount) && (invoiceHeader.discount > 0 && invoiceHeader.discount < 1)) {
        // prettier-ignore
        totalDiscoint = (subTotal * invoiceHeader.discount)
      } else {
        // prettier-ignore
        totalDiscoint = invoiceHeader.discount ? invoiceHeader.discount : 0.00
      }
  }

  function calculatePayments() {
    totalPayments = 0;
    if (payments.length > 0) {
      payments.map((e) => (totalPayments += Number.parseFloat(e.amount)));
    }
  }

  function calculateTax() {
    totalTax = 0;
    totalTax = (subTotal - totalDiscoint) * Number(invoiceHeader?.tax);
    // if (isEditable) {
    //   totalTax = (subTotal - totalDiscoint) * Number(invoiceHeader?.tax);
    //   return;
    // }
  }

  function calculateTotal() {
    totalAmount = 0;
    totalAmount = subTotal - totalDiscoint + totalTax;
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
    isEditable =
      (await currentRoute.queryParams.type) == "update" ? true : false;
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

    <Receipt
      bind:receipt
      bind:receiptSequence
      bind:isEditable
      bind:assignReceipt
      bind:tax={invoiceHeader.tax}
    />
  </div>
  <InvoiceDetailsForm
    bind:invoiceDetails
    bind:invoiceDetailsToDelete
    bind:addInvoiceDetailsAtSelectedItem
    bind:invoiceHeaderDiscont={invoiceHeader.discount}
    invoiceActive={invoiceHeader.status}
    {activeInvoiceDetails}
    calculateChange={calculatePending}
  />
  <div class="grid grid-cols-2 gap-5">
    <div class="max-w-full">
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
    <div class="flex flex-col space-y-3 justify-self-end min-w-[70%]">
      <Label class={customColorsClassDark.label}
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
      <div class="flex justify-center space-x-3">
        <Button
          color="green"
          class="min-w-[49%]"
          on:click={() => (discountModal = true)}>Aplicar Descuento</Button
        >
        <Button
          color="blue"
          class="min-w-[49%]"
          on:click={() => (paymentsModal = true)}>Aplicar Pagos</Button
        >
      </div>
      <div class="bg-white border-2 border-gray-300 shadow-lg p-5 rounded-lg">
        <div class="flex justify-between">
          <Heading tag="h4" class=" {customColorsClassDark.label}"
            >Subtotal:
          </Heading>
          <Span highlight class="text-2xl text-end"
            >{Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(subTotal)}</Span
          >
        </div>
        <div class="flex justify-between">
          <Heading tag="h4" class=" {customColorsClassDark.label}"
            >Descuento:
          </Heading>
          <Span highlight class="text-2xl text-end"
            >{Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(totalDiscoint)}</Span
          >
        </div>
        <div class="flex justify-between">
          <Heading tag="h4" class=" {customColorsClassDark.label}"
            >Impuesto:
          </Heading>
          <Span highlight class="text-2xl text-end"
            >{Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(totalTax)}</Span
          >
        </div>
        <hr class="my-2 bg-gray-400 h-1" />
        <div class="flex justify-between">
          <Heading tag="h4" class=" {customColorsClassDark.label}"
            >Total:
          </Heading>
          <Span
            highlight
            highlightClass="text-red-600 dark:text-red-500"
            class="text-2xl text-end"
            >{Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(totalAmount)}</Span
          >
        </div>
        <hr class="my-2 bg-gray-400 h-1" />
        <div class="flex justify-between">
          <Heading tag="h4" class={customColorsClassDark.label}>
            Pagado:
          </Heading>
          <Span
            highlight
            highlightClass="text-green-600 dark:text-green-500"
            class="text-2xl text-end"
            >{Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(totalPayments)}</Span
          >
        </div>
        <div class="flex justify-between">
          <Heading tag="h4" class=" {customColorsClassDark.label}"
            >Pendiente:
          </Heading>
          {#if pending > 0}
            <Span
              highlight
              highlightClass="text-red-600 dark:text-red-500"
              class="text-2xl text-end"
              >{Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(pending)}</Span
            >
          {:else}
            <Span
              highlight
              highlightClass="text-green-600 dark:text-green-500"
              class="text-2xl text-end"
              >{Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(pending)}</Span
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
</form>
<hr class="my-2 bg-gray-400 h-1" />
<div class="flex space-x-3 mt-5">
  <Button color="dark" on:click={() => navigateTo("/sales/invoices_list")}
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

<!-- modals -->
<Modal title="Aplicar descuentos" bind:open={discountModal} autoclose>
  <div>
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
        required={invoiceHeader.status}
        disabled={!invoiceHeader.status}
      />
    </ButtonGroup>
  </div>
  <svelte:fragment slot="footer">
    <Button color="alternative">Cerrar</Button>
  </svelte:fragment>
</Modal>

<Modal title="Aplicar pagos" bind:open={paymentsModal} autoclose={false}>
  <Payment
    bind:payments
    bind:totalPayments
    {calculatePending}
    {invoiceDetails}
    {invoiceHeader}
  />
  <svelte:fragment slot="footer">
    <Button color="alternative" on:click={() => (paymentsModal = false)}
      >Cerrar</Button
    >
  </svelte:fragment>
</Modal>
