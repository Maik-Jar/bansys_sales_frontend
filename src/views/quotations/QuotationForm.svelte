<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { salesTypes, taxes } from "../../lib/stores/stores";
  import QuotationDetailsForm from "./quotaion_details/QuotationDetailsForm.svelte";
  import Customer from "./customer/Customer.svelte";
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
  const quotationHeader = Object.seal({
    id: null,
    number: null,
    discount: 0.0,
    tax: 0.0,
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
  let quotationsDetails = [];
  let quotationsDetailsToDelete = [];

  let isEditable = false;
  let subTotal = 0;
  let totalTax = 0;
  let totalDiscoint = 0;
  let totalAmount = 0;
  let getCustomerForIdonChild;
  let addQuotationDetailsAtSelectedItem;
  let discountModal = false;

  $: activeQuotationDetails = customer?.id ? true : false;
  $: if (quotationsDetails) {
    calculateSubtotal();
    calculateDiscount();
    calculateTax();
    calculateTotal();
  }
  $: {
    quotationHeader.discount = quotationHeader.discount
      ? quotationHeader.discount
      : 0.0;
    calculateDiscount();
    calculateTax();
    calculateTotal();
  }
  $: {
    quotationHeader.tax = quotationHeader.tax ? quotationHeader.tax : 0.0;
    calculateDiscount();
    calculateTax();
    calculateTotal();
  }

  function getQuotation() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.quotaionsEndPoint +
          `?quotation_header_id=${currentRoute.queryParams.id}`,
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
            //quotation_details
            quotationsDetails = data.quotation_detail;
            //quotation_header
            quotationHeader.id = data.id;
            quotationHeader.number = data.number;
            quotationHeader.discount = data.discount;
            quotationHeader.tax = data.tax;
            quotationHeader.sales_type = data.sales_type;
            quotationHeader.comment = data.comment;
            quotationHeader.date_created = new Date(
              data.date_created
            ).toLocaleString("es-DO");
            quotationHeader.date_updated = new Date(
              data.date_updated
            ).toLocaleString("es-DO");
            quotationHeader.user_created = data.user_created;
            quotationHeader.user_updated = data.user_updated;
            quotationHeader.status = data.status;

            getCustomerForIdonChild();
            addQuotationDetailsAtSelectedItem(quotationsDetails);
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }

  function createQuotation() {
    let quotationToSave = {
      ...quotationHeader,
      quotation_detail: quotationsDetails,
      customer: customer,
    };
    Swal.fire({
      title: "¿Quieres crear esta nueva cotización?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(urls.backendRoute + urls.quotaionsEndPoint, {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${token.token}`,
          },
          body: JSON.stringify(quotationToSave),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              quotationHeader.id = data.id;
              quotationHeader.number = data.number;
              quotationHeader.date_created = new Date(
                data.date_created
              ).toLocaleString("es-DO");
              quotationHeader.date_updated = new Date(
                data.date_updated
              ).toLocaleString("es-DO");
              quotationHeader.user_created = data.user_created;
              quotationsDetails = data?.quotation_detail;

              Swal.fire("¡Nueva cotización creada!", "", "success");
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

  function updateQuotation() {
    let quotationToSave = {
      ...quotationHeader,
      quotation_detail: quotationsDetails,
      customer: customer,
      quotation_detail_to_delete: quotationsDetailsToDelete,
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
            urls.quotaionsEndPoint +
            `?quotation_header_id=${quotationHeader.id}`,
          {
            method: "put",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${token.token}`,
            },
            body: JSON.stringify(quotationToSave),
          }
        )
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              quotationHeader.date_updated = data.date_updated;
              quotationsDetails = data?.quotation_detail;
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

  function inactivateQuotation() {
    Swal.fire({
      title: "¿Esta seguro que desea inactivar esta cotización?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Si",
      denyButtonText: `¡No, Descartalo!`,
    }).then((result) => {
      if (result.isConfirmed) {
        const token = JSON.parse(localStorage.getItem("token"));
        fetch(
          urls.backendRoute +
            urls.quotaionsEndPoint +
            `?quotation_header_id=${quotationHeader.id}`,
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
              quotationHeader.status = false;
              Swal.fire("¡Cotaizaión inactivada!", "", "success");
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

  function calculateSubtotal() {
    subTotal = 0;
    quotationsDetails.map((e) => (subTotal += e.quantity * e.price));
  }

  function calculateDiscount() {
    totalDiscoint = 0;
    if (quotationHeader.discount < 0 || quotationHeader.discount == 0) {
      return totalDiscoint;
    }
    // prettier-ignore
    if (!Number.isInteger(quotationHeader.discount) && (quotationHeader.discount > 0 && quotationHeader.discount < 1)) {
        totalDiscoint = (subTotal * quotationHeader.discount)
      } else {
        totalDiscoint = quotationHeader.discount ? quotationHeader.discount : 0.00
      }
  }

  function calculateTax() {
    totalTax = 0;

    totalTax = (subTotal - totalDiscoint) * quotationHeader.tax;
  }

  function calculateTotal() {
    totalAmount = 0;
    totalAmount = subTotal - totalDiscoint + totalTax;
  }

  function validateCustomer() {
    if (!customer.name) {
      Swal.fire(
        "Escoga el cliente al que se le realizará la cotización.",
        "",
        "warning"
      );
      return false;
    }

    return true;
  }

  function validateDetails() {
    if (!(quotationsDetails.length > 0)) {
      Swal.fire("Inserte al menos un item para cotizar.", "", "warning");
      return false;
    }
    return true;
  }

  function validations(callback) {
    const allValidations = {
      customer: validateCustomer,
      quotationDetails: validateDetails,
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

  function printQuotation(quotationID) {
    if (quotationHeader.status) {
      window.open(
        urls.backendRoute +
          urls.printQuotationEndpoint +
          `?quotation_header_id=${quotationID}&papel_size="A4"`,
        "_blank"
      );
    }
  }

  function printQuotation60mm(quotationID) {
    if (quotationHeader.status) {
      window.open(
        urls.backendRoute +
          urls.printQuotation60mmEndpoint +
          `?quotation_header_id=${quotationID}&papel_size="A60mm"`,
        "_blank"
      );
    }
  }

  onMount(async () => {
    isEditable =
      (await currentRoute.queryParams.type) == "update" ? true : false;
    getQuotation();
  });
</script>

<form
  id="form_invoice"
  class="pl-0 p-4 relative"
  on:submit|preventDefault|stopPropagation={isEditable
    ? () => validations(updateQuotation)
    : () => validations(createQuotation)}
>
  <div
    class="flex justify-between items-center pb-5 mb-2 border-b-4 border-gray-100 dark:border-gray-400"
  >
    <Heading tag="h4" class="w-1/2 {customColorsClassDark.label} self-end"
      >No. Cotización: <Span highlight
        >{quotationHeader.number ? quotationHeader.number : ""}</Span
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
          bind:value={quotationHeader.date_created}
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
          bind:value={quotationHeader.date_updated}
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
        quotationActive={quotationHeader.status}
      />
    </div>
    <Heading tag="h5" class={customColorsClassDark.label}
      >Estatus cotización: <Badge
        large
        color={quotationHeader.status ? "green" : "red"}
        >{quotationHeader.status ? "Activo" : "Inactivo"}</Badge
      ></Heading
    >
    <Label class={customColorsClassDark.label}>
      Impuesto
      <Select
        class="mt-2 {customColorsClassDark.input}"
        bind:value={quotationHeader.tax}
        required={quotationHeader.status}
        disabled={!quotationHeader.status}
      >
        {#each $taxes as { percentage, name }}
          <option value={percentage}>{name}</option>
        {/each}
      </Select>
    </Label>
  </div>
  <QuotationDetailsForm
    bind:quotationsDetails
    bind:addQuotationDetailsAtSelectedItem
    bind:quotationsDetailsToDelete
    quotationActive={quotationHeader.status}
    {activeQuotationDetails}
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
        bind:value={quotationHeader.comment}
        disabled={!quotationHeader.status}
      />
    </div>
    <div class="flex flex-col space-y-3 justify-self-end min-w-[70%]">
      <Label class="{customColorsClassDark.label} col-start-4"
        >Tipo de venta
        <Select
          class="mt-2 {customColorsClassDark.input}"
          bind:value={quotationHeader.sales_type}
          required={quotationHeader.status}
          disabled={!quotationHeader.status}
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
      </div>
    </div>
  </div>
</form>
<hr class="my-2 bg-gray-400 h-1" />
<div class="flex space-x-3 mt-5">
  <Button color="dark" on:click={() => navigateTo("/sales/quotations_list")}
    >Volver</Button
  >
  {#if hasPermission("point_of_sales.add_quotationheader") || hasPermission("point_of_sales.change_quotationheader")}
    <Button
      color="green"
      type="submit"
      form="form_invoice"
      disabled={!quotationHeader.status}>Guardar</Button
    >
  {/if}
  {#if hasPermission("point_of_sales.delete_quotationheader")}
    <Button
      color="red"
      type="button"
      on:click={inactivateQuotation}
      disabled={!quotationHeader.status || !quotationHeader.id}
      >Inactivar</Button
    >
  {/if}
  <Button
    color="blue"
    type="button"
    disabled={!quotationHeader.status || !quotationHeader.id}
    >Imprimir<ChevronDownSolid
      class="w-3 h-3 ms-2 text-white dark:text-white"
    /></Button
  >
  <Dropdown>
    <DropdownItem on:click={() => printQuotation(quotationHeader.id)}
      >A4</DropdownItem
    >
    <DropdownItem on:click={() => printQuotation60mm(quotationHeader.id)}
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
        bind:value={quotationHeader.discount}
        required={quotationHeader.status}
        disabled={!quotationHeader.status}
      />
    </ButtonGroup>
  </div>
  <svelte:fragment slot="footer">
    <Button color="alternative">Cerrar</Button>
  </svelte:fragment>
</Modal>
