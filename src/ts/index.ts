import { Product } from "./Product";
import axios from "axios";

const serverUrl = "http://localhost:5000";

const api = axios.create({
  baseURL: serverUrl,
});

interface IResponse {
  data: Product[];
}

interface IProductCart extends Product {
  amount: number;
}

interface IEvent extends Event {
  target: HTMLElement;
}

interface IInputEvent extends Event {
  target: HTMLInputElement;
}

const sizeFilters: Array<string> = [];
const colorFilters: Array<string> = [];
const priceFilter: Array<number> = [];
let order: string = "";
const cartItems: IProductCart[] =
  JSON.parse(localStorage.getItem("@M3-cart")) || [];
let showAll: boolean = false;
let showColors: boolean = false;

function renderProducts(products: Product[]) {
  const container = document.querySelector(".products-list");
  container.innerHTML = "";
  (showAll ? products : products.slice(0, 8)).forEach((elem) => {
    const productCard = document.createElement("li");
    const productImg = document.createElement("img");
    const productName = document.createElement("h3");
    const productValue = document.createElement("span");
    const productParcelamento = document.createElement("span");
    const productButton = document.createElement("button");

    productCard.classList.add("product");
    productValue.classList.add("product-value");
    productParcelamento.classList.add("product-parcelamento");

    productImg.src = elem.image;
    productName.innerText = elem.name.toUpperCase();
    productValue.innerText = `R$ ${elem.price.toFixed(2).replace(".", ",")}`;
    productParcelamento.innerText = `até ${
      elem.parcelamento[0]
    }x de R$${elem.parcelamento[1].toFixed(2).replace(".", ",")}`;
    productButton.innerText = "COMPRAR";

    productButton.addEventListener("click", (_) => {
      const cartIndex = cartItems.findIndex(
        (element) => element.name === elem.name
      );
      if (cartIndex == -1) {
        cartItems.push({ ...elem, amount: 1 });
      } else {
        cartItems[cartIndex].amount += 1;
      }
      localStorage.setItem("@M3-cart", JSON.stringify(cartItems));
      renderCartProducts();
    });

    productCard.append(
      productImg,
      productName,
      productValue,
      productParcelamento,
      productButton
    );
    container.append(productCard);
  });
  if (!products[0]) {
    const noProducts = document.createElement("h3");
    noProducts.innerText = "Desculpe, nenhum produto encontrado :(";
    container.append(noProducts);
  }
}
function filterBySize(products: Product[]) {
  Array.from(document.getElementsByClassName("size-filter")).forEach((elem) => {
    elem.addEventListener("click", (e: IInputEvent) => {
      if (e.target.tagName === "BUTTON") {
        if (e.target.classList.contains("selected")) {
          const sizeIndex = sizeFilters.findIndex(
            (elem) => elem === e.target.innerText
          );
          sizeFilters.splice(sizeIndex, 1);
        } else {
          sizeFilters.push(e.target.innerText);
        }
        Array.from(document.getElementsByClassName("size-button")).forEach(
          (button) => {
            if (sizeFilters.includes(button.innerHTML)) {
              button.classList.add("selected");
            } else {
              button.classList.remove("selected");
            }
          }
        );
        filterProducts(products);
      }
    });
  });
}

function filterByColor(products: Product[]) {
  Array.from(document.getElementsByClassName("color-filter")).forEach(
    (elem) => {
      elem.addEventListener("click", (e: IInputEvent) => {
        if (e.target.name === "color") {
          if (e.target.checked) {
            colorFilters.push(e.target.value);
          } else {
            const colorIndex = colorFilters.findIndex(
              (elem) => elem === e.target.value
            );
            colorFilters.splice(colorIndex, 1);
          }
          filterProducts(products);
        }
        Array.from(document.getElementsByName("color")).forEach(
          (checkbox: any) => {
            if (colorFilters.includes(checkbox.value)) {
              checkbox.checked = true;
            } else {
              checkbox.checked = false;
            }
          }
        );
      });
    }
  );
}

function filterByPrice(products: Product[]) {
  Array.from(document.getElementsByClassName("price-filters")).forEach(
    (elem) => {
      elem.addEventListener("click", (e: Event) => {
        if (
          e.target instanceof HTMLInputElement &&
          (e.target.name == "price-filter" || e.target.name == "price-filter2")
        ) {
          if (e.target.classList.contains("checked")) {
            Array.from(document.getElementsByClassName("price-filter")).forEach(
              (element: any) => {
                element.classList.remove("checked");
                element.checked = false;
              }
            );
            priceFilter.splice(0, 2);
          } else {
            priceFilter[0] = parseFloat(e.target.value.split("-")[0]);
            priceFilter[1] =
              parseFloat(e.target.value.split("-")[1]) || Infinity;
            Array.from(document.getElementsByClassName("price-filter")).forEach(
              (element: any) => {
                if (element.value.split("-")[0] == priceFilter[0]) {
                  element.classList.add("checked");
                  element.checked = true;
                } else {
                  element.classList.remove("checked");
                  element.checked = false;
                }
              }
            );
          }
          filterProducts(products);
        }
      });
    }
  );
}

function filterProducts(products: Product[]) {
  const filteredProducts = products.filter((elem) => {
    if (sizeFilters[0] || colorFilters[0] || priceFilter[1]) {
      return (
        (sizeFilters[0]
          ? elem.size.some((size) => sizeFilters.includes(size))
          : true) &&
        (colorFilters[0] ? colorFilters.includes(elem.color) : true) &&
        (priceFilter[1]
          ? elem.price > priceFilter[0] && elem.price < priceFilter[1]
          : true)
      );
    } else {
      return true;
    }
  });
  if (order) {
    switch (order) {
      case "recents":
        filteredProducts.sort(
          (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
        );
        break;
      case "expensive":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "cheaper":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;

      default:
        break;
    }
  }
  renderProducts(filteredProducts);
}

function openModals() {
  document.querySelector(".mobile").addEventListener("click", (e: IEvent) => {
    if (e.target.classList.contains("filter-button")) {
      const modal: HTMLElement = document.getElementsByClassName(
        "modal-filter"
      )[0] as HTMLElement;
      modal.style.display = "block";
    }
    if (e.target.classList.contains("order-button")) {
      const modal: HTMLElement = document.getElementsByClassName(
        "modal-order"
      )[0] as HTMLElement;
      modal.style.display = "block";
    }
  });
  document.querySelector(".open-cart").addEventListener("click", (_) => {
    const modal = document.querySelector(".modal-cart") as HTMLElement;
    modal.style.display = "flex";
  });
  const closeFilterModal = document.querySelector(
    ".close-filter-modal"
  ) as HTMLElement;
  closeFilterModal.addEventListener("click", (_) => {
    const modal: HTMLElement = document.getElementsByClassName(
      "modal-filter"
    )[0] as HTMLElement;
    modal.style.display = "none";
  });
  const closeOrderModal = document.querySelector(
    ".close-order-modal"
  ) as HTMLElement;
  closeOrderModal.addEventListener("click", (_) => {
    const modal: HTMLElement = document.getElementsByClassName(
      "modal-order"
    )[0] as HTMLElement;
    modal.style.display = "none";
  });
  const closeCart = document.querySelector(".close-cart-modal");
  closeCart.addEventListener("click", (_) => {
    const modal = document.querySelector(".modal-cart") as HTMLElement;
    modal.style.display = "none";
  });
  const modalCart = document.querySelector(".modal-cart") as HTMLElement;
  modalCart.addEventListener("click", (e: IEvent) => {
    if (e.target.classList.contains("modal-cart")) {
      modalCart.style.display = "none";
    }
  });
}

function orderBy(products: Product[]) {
  const select = document.querySelector(".order-filter") as HTMLInputElement;
  select.addEventListener("input", (e: IInputEvent) => {
    Array.from(document.getElementsByClassName("order-mobile")).forEach(
      (element: HTMLElement) => {
        element.style.filter = "brightness(1)";
      }
    );
    order = e.target.value;
    const mobileOrder = document.querySelector(`.${order}`) as HTMLElement;
    mobileOrder.style.filter = "brightness(0.95)";
    filterProducts(products);
  });
  Array.from(document.getElementsByClassName("order-mobile")).forEach(
    (elem) => {
      elem.addEventListener("click", (e: IEvent) => {
        Array.from(document.getElementsByClassName("order-mobile")).forEach(
          (element: HTMLElement) => {
            element.style.filter = "brightness(1)";
          }
        );
        order = e.target.classList[0];
        e.target.style.filter = "brightness(0.95)";
        select.value = order;
        filterProducts(products);
      });
    }
  );
}

function renderCartProducts() {
  const cartList = document.querySelector(".cart-products");
  cartList.innerHTML = "";
  cartItems.forEach((elem, index) => {
    const productCard = document.createElement("li");
    const productImg = document.createElement("img");
    const productInfoContainer = document.createElement("div");
    const productName = document.createElement("h3");
    const productValue = document.createElement("span");
    const productQuantityContainer = document.createElement("div");
    const productSub = document.createElement("button");
    const productAmount = document.createElement("span");
    const productAdd = document.createElement("button");

    productQuantityContainer.classList.add("quantity-container");

    productImg.src = elem.image;
    productName.innerText = elem.name.toUpperCase();
    productValue.innerText = `R$ ${(elem.price * elem.amount)
      .toFixed(2)
      .replace(".", ",")}`;
    productSub.innerText = "-";
    productAmount.innerText = elem.amount + "";
    productAdd.innerText = "+";

    productSub.addEventListener("click", (_) => {
      if (elem.amount == 1) {
        cartItems.splice(index, 1);
      } else {
        cartItems[index].amount -= 1;
      }
      localStorage.setItem("@M3-cart", JSON.stringify(cartItems));
      renderCartProducts();
    });

    productAdd.addEventListener("click", (_) => {
      cartItems[index].amount += 1;
      localStorage.setItem("@M3-cart", JSON.stringify(cartItems));
      renderCartProducts();
    });

    productQuantityContainer.append(productSub, productAmount, productAdd);
    productInfoContainer.append(
      productName,
      productValue,
      productQuantityContainer
    );
    productCard.append(productImg, productInfoContainer);
    cartList.append(productCard);
  });
  const totalPrice = document.querySelector(".total-price");
  totalPrice.innerHTML = `Valor total: R$ ${cartItems
    .reduce((acc, elem) => elem.price * elem.amount + acc, 0)
    .toFixed(2)
    .replace(".", ",")}`;
  const cartAmount = document.querySelector(".cart-amount");
  cartAmount.innerHTML =
    cartItems.reduce((acc, elem) => elem.amount + acc, 0) + "";

  if (!cartItems[0]) {
    const noProducts = document.createElement("h3");
    noProducts.innerText =
      "Carrinho vazio, adicione items para vizualiza-los aqui! :)";
    cartList.append(noProducts);
  }
}

function showMore(products: Product[]) {
  const loadMoreButton = document.querySelector(
    ".load-more-button"
  ) as HTMLElement;
  loadMoreButton.addEventListener("click", (_) => {
    if (showAll) {
      showAll = false;
      loadMoreButton.innerText = "CARREGAR MAIS";
    } else {
      showAll = true;
      loadMoreButton.innerText = "CARREGAR MENOS";
    }
    filterProducts(products);
  });
}

function showMoreColors() {
  const showMoreColors = document.querySelector(
    ".show-all-colors"
  ) as HTMLElement;
  Array.from(document.getElementsByName("color"))
    .slice(5, 10)
    .forEach((elem) => {
      elem.parentElement.style.display = "none";
      showMoreColors.innerHTML = `Ver todas as cores
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-chevron-down"
      ><polyline points="6 9 12 15 18 9"></polyline>`;
      showColors = false;
    });
  showMoreColors.addEventListener("click", (_) => {
    if (showColors) {
      Array.from(document.getElementsByName("color"))
        .slice(5, 9)
        .forEach((elem) => {
          elem.parentElement.style.display = "none";
          showMoreColors.innerHTML = `Ver todas as cores
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-chevron-down"
        ><polyline points="6 9 12 15 18 9"></polyline>`;
          showColors = false;
        });
    } else {
      Array.from(document.getElementsByName("color"))
        .slice(5, 9)
        .forEach((elem) => {
          elem.parentElement.style.display = "block";
          showMoreColors.innerHTML = `Minimizar cores
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-chevron-down"
        ><polyline points="6 9 12 15 18 9"></polyline>`;
          showColors = true;
        });
    }
  });
}

async function main() {
  const { data: products }: IResponse = await api.get("/products");
  renderProducts(products);
  filterBySize(products);
  filterByColor(products);
  filterByPrice(products);
  openModals();
  orderBy(products);
  renderCartProducts();
  showMore(products);
  showMoreColors();
}

document.addEventListener("DOMContentLoaded", main);
