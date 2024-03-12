<script>
  import { urls } from "../../../lib/utils/urls";
  import { onMount } from "svelte";
  import { receipts } from "../../../lib/stores/stores";
  import {
    Label,
    Input,
    Select,
    InputAddon,
    ButtonGroup,
  } from "flowbite-svelte";

  export let receipt;
  export let tax;
  export let receiptSequence;
  export let isEditable = false;
  export function assignReceipt(rs) {
    if (rs != null && Object.keys(rs).length > 0) {
      selectedReceipt = rs?.receipt.id;
    }
  }

  const customColorsClassDark = {
    label: "dark:text-gray-500",
    input: "dark:bg-gray-50 dark:text-black",
  };

  let selectedReceipt = 1;

  $: if (selectedReceipt) {
    receipt = $receipts.find((e) => e.id == selectedReceipt);
    tax = receipt?.tax?.percentage;
  }
</script>

<Label class={customColorsClassDark.label}
  >Tipo de comprobante
  <Select
    class="mt-2 {customColorsClassDark.input}"
    bind:value={selectedReceipt}
    required={!isEditable}
    disabled={isEditable}
  >
    {#each $receipts as { id, name }}
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
        {receipt?.serial}
      </InputAddon>
      <Input
        id="receiptSequence"
        class={customColorsClassDark.input}
        value={receiptSequence?.sequence}
        readonly
      />
    </ButtonGroup>
  </div>
  <div class="w-full">
    <Label for="recepitExpiration" class="mb-2 {customColorsClassDark.label}"
      >Fecha de expiración</Label
    >
    <Input
      id="recepitExpiration"
      type="text"
      class={customColorsClassDark.input}
      value={receiptSequence?.expiration}
      readonly
    />
  </div>
</div>
