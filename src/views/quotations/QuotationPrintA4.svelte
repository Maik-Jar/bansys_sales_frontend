<script>
  import { urls } from "../../lib/utils/urls";
  import { company, documentsTypes, salesTypes } from "../../lib/stores/stores";
  import { parsePhoneNumber } from "libphonenumber-js";
  import { Spinner } from "flowbite-svelte";

  export let currentRoute;

  let quotationHeader;

  async function getQuotation() {
    const token = JSON.parse(localStorage.getItem("token"));
    await fetch(
      urls.backendRoute +
        urls.printQuotationEndpoint +
        `?quotation_header_id=${currentRoute.queryParams.quotationId}`,
      {
        headers: {
          Authorization: `Token ${token.token}`,
        },
      }
    )
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          quotationHeader = data;

          return data;
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function calculateSubtotal() {
    let subTotal = 0.0;

    quotationHeader.quotation_detail.map((e) => {
      subTotal += e.quantity * e.price;
    });

    return subTotal;
  }

  function calculateDiscount(subTotal) {
    let totalDiscount = 0;

    if (quotationHeader.discount < 0 || quotationHeader.discount == 0) {
      return totalDiscount;
    }
    // prettier-ignore
    if (!Number.isInteger(quotationHeader.discount) && (quotationHeader.discount > 0 && quotationHeader.discount < 1)) {
        // prettier-ignore
        totalDiscount = (subTotal * quotationHeader.discount)
      } else {
        // prettier-ignore
        totalDiscount = quotationHeader.discount ? quotationHeader.discount : 0.00
      }

    return totalDiscount;
  }

  function calculateTax(subTotal, totalDiscount) {
    let totalTax = 0;
    totalTax = (subTotal - totalDiscount) * Number(quotationHeader?.tax);

    return totalTax;
  }

  function calculateTotal(subTotal, totalDiscount, totalTax) {
    let totalAmount = 0.0;
    totalAmount = subTotal - totalDiscount + totalTax;

    return totalAmount;
  }
</script>

{#await getQuotation()}
  <div class="my-72 text-center">
    <Spinner size={8} color="green" />
  </div>
{:then data}
  <div
    class="text-gray-700 bg-white rounded-lg shadow-2xl shadow-black print:shadow-none px-[50px] py-[40px] max-w-[850px] min-h-full mx-auto my-4"
  >
    <div class="grid grid-cols-2 items-center mb-2">
      <div>
        <img
          src={urls.backendRoute + $company?.logo}
          alt={$company?.name}
          style="width: 70%; max-height: 70%"
        />
      </div>
      <div class="text-end">
        <h1 class="text-2xl font-semibold">COTIZACIÓN</h1>
      </div>
    </div>
    <hr class="my-2" />
    <div class="flex justify-between">
      <div class="text-xs">
        <span class="text-sm font-semibold">Fecha: </span>{new Date(
          quotationHeader?.date_created
        ).toLocaleString("es-DO")}
      </div>
      <div class="text-xs">
        <span class="text-sm font-semibold"
          >Factura No.
        </span>{quotationHeader?.number}
      </div>
    </div>
    <hr class="my-2" />
    <div class="grid grid-cols-2 gap-x-5 mb-6">
      <div class="text-gray-700">
        <h2 class="text-sm font-bold mb-4 capitalize">
          Información del cliente
        </h2>
        <div class="text-gray-700 text-xs uppercase">
          {quotationHeader?.customer.name}
        </div>
        {#if quotationHeader?.customer.document_id}
          <div class="text-gray-700 text-xs uppercase">
            {$documentsTypes.find(
              (e) => e.id == quotationHeader?.customer.document_type
            )?.name}
            {quotationHeader?.customer.document_id}
          </div>
        {/if}
        <div class="text-gray-700 text-xs uppercase">
          {quotationHeader?.customer.address
            ? quotationHeader?.customer.address
            : ""}
        </div>
        <div class="text-gray-700 text-xs uppercase">
          {parsePhoneNumber(
            quotationHeader?.customer.phone,
            "DO"
          ).formatNational()}
        </div>
      </div>
      <div class="text-gray-700">
        <h2 class="text-sm font-bold mb-4 capitalize">
          Información de la Factura
        </h2>
        <div class="text-gray-700 text-sm capitalize font-semibold">Venta:</div>
        <p class="uppercase text-xs">
          {$salesTypes.find((e) => e.id == quotationHeader?.sales_type).name}
        </p>
        <div class="text-gray-700 text-sm capitalize font-semibold">
          Atendido por:
        </div>
        <p class="uppercase text-xs">
          {quotationHeader?.user_created.first_name}
          {quotationHeader?.user_created.last_name}
        </p>
      </div>
    </div>
    <h1 class="text-sm font-bold text-center mb-1">Detalle</h1>
    <hr />
    <table class="table-fixed w-full mb-4">
      <thead>
        <tr>
          <th
            class="w-[400px] text-sm text-gray-700 font-bold uppercase py-2 text-left"
          >
            Descripción
          </th>
          <th
            class="w-[75px] text-sm text-gray-700 font-bold uppercase py-2 text-center"
          >
            Cant.
          </th>
          <th
            class="w-[100px] text-sm text-gray-700 font-bold uppercase py-2 text-left"
          >
            Precio Und.
          </th>
          <th
            class="w-[100px] text-sm text-gray-700 font-bold uppercase py-2 text-left"
          >
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {#each quotationHeader?.quotation_detail as detail}
          <tr>
            <td class="text-xs text-left pb-2 text-gray-700"
              >{detail.item.name}
              {#if detail.description}:
                <div class="font-semibold text-xs lowercase">
                  {detail.description}
                </div>
              {/if}
            </td>
            <td class="text-xs text-center pb-2 text-gray-700"
              >{detail.quantity}</td
            >
            <td class="text-xs text-left pb-2 text-gray-700"
              >{Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(detail.price)}</td
            >
            <td class="text-xs text-left font-semibold pb-2 text-gray-700"
              >{Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(detail.quantity * detail.price)}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
    <hr class="mb-4" />
    <div class="flex justify-end items-end mb-2">
      <div>
        <div class="flex justify-between mb-2">
          <p class="text-sm font-semibold mr-2">Subtotal:</p>
          <p class="text-sm">
            {Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(calculateSubtotal())}
          </p>
        </div>
        <div class="flex justify-between mb-2">
          <p class="text-sm font-semibold mr-2">Descuento:</p>
          <p class="text-sm">
            {Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(calculateDiscount(calculateSubtotal()))}
          </p>
        </div>
        <div class="flex justify-between">
          <p class="text-sm font-semibold mr-2">Impuesto:</p>
          <p class="text-sm">
            {Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(
              calculateTax(
                calculateSubtotal(),
                calculateDiscount(calculateSubtotal())
              )
            )}
          </p>
        </div>
        <hr class="my-3 w-full" />
        <div class="flex justify-between mb-3">
          <p class="text-md font-semibold mr-2">Total:</p>
          <p class="font-bold text-md">
            {Intl.NumberFormat("es-DO", {
              style: "currency",
              currency: "DOP",
            }).format(
              calculateTotal(
                calculateSubtotal(),
                calculateDiscount(calculateSubtotal()),
                calculateTax(
                  calculateSubtotal(),
                  calculateDiscount(calculateSubtotal())
                )
              )
            )}
          </p>
        </div>
      </div>
    </div>
    <hr />
    <div class="pt-4 mb-8">
      {#if quotationHeader?.comment}
        <p class="text-sm font-semibold mb-2">Comentarios:</p>
        <p class=" text-xs">{quotationHeader?.comment}</p>
      {/if}
    </div>
  </div>
{/await}
