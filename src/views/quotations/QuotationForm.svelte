<script>
  import { navigateTo } from "svelte-router-spa";
  import Swal from "sweetalert2";
  import { urls } from "../../lib/utils/urls";
  import { onMount } from "svelte";
  import { salesTypes } from "../../lib/stores/stores";
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
  } from "flowbite-svelte";

  export let currentRoute;

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };
  const quotationHeader = Object.seal({
    id: null,
    number: null,
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
    name: "",
    document_id: "",
    phone: "",
  });
  let quotationsDetails = [];
  let quotationsDetailsToDelete = [];
  let isEditable = false;
  let totalAmount = 0;
  //   let getCustomerForIdonChild;
  let addQuotationDetailsAtSelectedItem;

  $: activeQuotationDetails = customer?.name ? true : false;

  function getQuotation() {
    if (isEditable) {
      const token = JSON.parse(localStorage.getItem("token"));
      fetch(
        urls.backendRoute +
          urls.quotaionsEndPoint +
          `?quotation_header_id=${currentRoute.namedParams.id}`,
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
            customer.document_id = data.customer?.document_id;
            customer.phone = data.customer?.phone;
            //quotation_details
            quotationsDetails = await data.quotation_detail;
            //quotation_header
            quotationHeader.id = data.id;
            quotationHeader.number = data.number;
            quotationHeader.discount = data.discount;
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

            // getCustomerForIdonChild();
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
              console.log(data?.quotation_detail);
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

  function appliyGeneralDiscount() {
    let discountPerDetail = 0;

    quotationsDetails = quotationsDetails.map((e) => {
      e.discount = 0;
      return e;
    });

    if (quotationHeader.discount < 0) {
      return;
    }

    discountPerDetail =
      quotationHeader.discount > 0 && quotationHeader.discount < 1
        ? quotationHeader.discount
        : quotationHeader.discount / quotationsDetails.length;

    quotationsDetails = quotationsDetails.map((e) => {
      e.discount = discountPerDetail;
      return e;
    });
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

  onMount(async () => {
    isEditable = (await currentRoute.namedParams.id) ? true : false;
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
      <Customer bind:customer quotationActive={quotationHeader.status} />
    </div>
    <Heading tag="h5" class=" {customColorsClassDark.label}"
      >Estatus cotización: <Badge
        large
        color={quotationHeader.status ? "green" : "red"}
        >{quotationHeader.status ? "Activo" : "Inactivo"}</Badge
      ></Heading
    >
  </div>
  <QuotationDetailsForm
    bind:quotationDetails={quotationsDetails}
    bind:quotationDetailsToDelete={quotationsDetailsToDelete}
    bind:totalAmount
    bind:addQuotationDetailsAtSelectedItem
    bind:quotationHeaderDiscont={quotationHeader.discount}
    quotationActive={quotationHeader.status}
    {activeQuotationDetails}
  />
  <div class="grid grid-cols-4 gap-4">
    <div class="col-start-1 col-span-2 2xl:col-span-1 row-span-3">
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
    <div class="col-start-4">
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
          on:blur={appliyGeneralDiscount}
          required={quotationHeader.status}
          disabled={!quotationHeader.status}
        />
      </ButtonGroup>
    </div>
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
  </div>
</form>
<div class="flex space-x-3 mt-5">
  <Button color="dark" on:click={() => navigateTo("/quotations_manager")}
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
    on:click={() => printQuotation(quotationHeader.id)}
    disabled={!quotationHeader.status || !quotationHeader.id}>Imprimir</Button
  >
</div>
