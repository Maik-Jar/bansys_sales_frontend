<script>
  import { urls } from "../../lib/utils/urls";
  import { Route, navigateTo, Navigate } from "svelte-router-spa";
  import {
    DarkMode,
    Navbar,
    NavHamburger,
    NavBrand,
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    Breadcrumb,
    BreadcrumbItem,
  } from "flowbite-svelte";

  export let currentRoute;

  let spanClass = "flex-1 ml-3 whitespace-nowrap";

  function signout() {
    localStorage.setItem("isLogin", JSON.stringify(false));
    localStorage.setItem("token", "");
    navigateTo("login");
  }
</script>

<div class="h-screen max-h-screen bg-white dark:bg-gray-900">
  <Navbar let:hidden let:toggle class={"bg-white dark:bg-gray-900"}>
    <NavBrand href="/">
      <img
        src="/src/assets/svelte.svg"
        class="mr-3 h-6 sm:h-9"
        alt="Flowbite Logo"
      />
      <span
        class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
      >
        Svelte
      </span>
    </NavBrand>
    <NavHamburger on:click={toggle} />

    <DarkMode />
  </Navbar>

  <div class=" flex h-[87%] w-full">
    <Sidebar class={"h-full w-72"}>
      <SidebarWrapper class={"h-full bg-white dark:bg-gray-900"}>
        <SidebarGroup>
          <SidebarItem label="Dashboard">
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
                /><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
                /></svg
              >
            </svelte:fragment>
          </SidebarItem>
          <SidebarDropdownWrapper label="Facturación">
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.6em"
                height="1.6em"
                viewBox="0 0 24 24"
                {...$$props}
                ><path
                  fill="currentColor"
                  d="M11.025 21v-2.15q-1.325-.3-2.288-1.15t-1.412-2.4l1.85-.75q.375 1.2 1.113 1.825t1.937.625q1.025 0 1.738-.463t.712-1.437q0-.875-.55-1.387t-2.55-1.163q-2.15-.675-2.95-1.613t-.8-2.287q0-1.625 1.05-2.525t2.15-1.025V3h2v2.1q1.25.2 2.063.913t1.187 1.737l-1.85.8q-.3-.8-.85-1.2t-1.5-.4q-1.1 0-1.675.488T9.825 8.65q0 .825.75 1.3t2.6 1q1.725.5 2.613 1.588t.887 2.512q0 1.775-1.05 2.7t-2.6 1.15V21h-2Z"
                /></svg
              >
            </svelte:fragment>
            <SidebarDropdownItem
              label="Gestión de facturas"
              on:click={() => navigateTo("invoices_manager")}
            />
          </SidebarDropdownWrapper>
          <SidebarDropdownWrapper label="Clientes">
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.6em"
                height="1.6em"
                viewBox="0 0 24 24"
                {...$$props}
                ><path
                  fill="currentColor"
                  d="M2 20v-2.8q0-.85.425-1.563T3.6 14.55q1.5-.75 3.112-1.15T10 13q.625 0 1.25.088t1.25.212v1.575q-1.125.55-1.813 1.45T10 18.675V20H2Zm10 0v-1.4q0-.6.313-1.113t.887-.737q.9-.375 1.863-.563T17 16q.975 0 1.938.188t1.862.562q.575.225.888.738T22 18.6V20H12Zm5-5q-1.05 0-1.775-.725T14.5 12.5q0-1.05.725-1.775T17 10q1.05 0 1.775.725T19.5 12.5q0 1.05-.725 1.775T17 15Zm-7-3q-1.65 0-2.825-1.175T6 8q0-1.65 1.175-2.825T10 4q1.65 0 2.825 1.175T14 8q0 1.65-1.175 2.825T10 12Z"
                /></svg
              >
            </svelte:fragment>
            <SidebarDropdownItem
              label="Gestión de clientes"
              on:click={() => navigateTo("customers_manager")}
            />
          </SidebarDropdownWrapper>
          <SidebarDropdownWrapper label="Proveedores">
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.6em"
                height="1.6em"
                viewBox="0 0 24 24"
                {...$$props}
                ><path
                  fill="currentColor"
                  d="M6 20q-1.25 0-2.125-.875T3 17H1V6q0-.825.588-1.413T3 4h14v4h3l3 4v5h-2q0 1.25-.875 2.125T18 20q-1.25 0-2.125-.875T15 17H9q0 1.25-.875 2.125T6 20Zm0-2q.425 0 .713-.288T7 17q0-.425-.288-.713T6 16q-.425 0-.713.288T5 17q0 .425.288.713T6 18Zm12 0q.425 0 .713-.288T19 17q0-.425-.288-.713T18 16q-.425 0-.713.288T17 17q0 .425.288.713T18 18Zm-1-5h4.25L19 10h-2v3Z"
                /></svg
              >
            </svelte:fragment>
            <SidebarDropdownItem
              label="Gestión de proveedores"
              on:click={() => navigateTo("providers_manager")}
            />
          </SidebarDropdownWrapper>
          <SidebarDropdownWrapper label="Productos & Servicios">
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.6em"
                height="1.6em"
                viewBox="0 0 24 24"
                {...$$props}
                ><path
                  fill="currentColor"
                  d="M5 21q-.825 0-1.413-.588T3 19V6.525q0-.35.113-.675t.337-.6L4.7 3.725q.275-.35.687-.538T6.25 3h11.5q.45 0 .863.188t.687.537l1.25 1.525q.225.275.338.6t.112.675V19q0 .825-.588 1.413T19 21H5Zm.4-15h13.2l-.85-1H6.25L5.4 6ZM16 8H8v8l4-2l4 2V8Z"
                /></svg
              >
            </svelte:fragment>
            <SidebarDropdownItem
              label="Gestión de items"
              on:click={() => navigateTo("items_manager")}
            />
          </SidebarDropdownWrapper>
          <SidebarItem label="Sign In" on:click={signout}>
            <svelte:fragment slot="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                /></svg
              >
            </svelte:fragment>
          </SidebarItem>
        </SidebarGroup>
      </SidebarWrapper>
    </Sidebar>
    <!-- Contenido principal -->
    <span />
    <div
      class="flex-1 mx-4 p-6 bg-gray-200 dark:bg-gray-200 rounded-3xl h-full overflow-auto"
    >
      <Breadcrumb
        aria-label="Default breadcrumb example"
        class={"mb-5 dark:text-gray-500"}
      >
        <BreadcrumbItem home>Home</BreadcrumbItem>
        <BreadcrumbItem>Projects</BreadcrumbItem>
        <BreadcrumbItem>Flowbite Svelte</BreadcrumbItem>
      </Breadcrumb>

      <!-- Aquí coloca el contenido principal de tu página -->
      <Route {currentRoute} />
    </div>
  </div>
</div>
