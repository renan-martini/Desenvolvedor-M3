import { Product } from "./Product";
import axios from "axios";

const serverUrl = "http://localhost:5000";

const api = axios.create({
  baseURL: serverUrl,
});

interface IResponse {
  data: Product[];
}

const sizeFilters: Array<string> = [];
const colorFilters: Array<string> = [];
const priceFilter: Array<number> = [];

function renderProducts(products: Product[]) {
  const container = document.querySelector(".products-list");
  container.innerHTML = "";
  products.forEach((elem) => {
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

    productCard.append(
      productImg,
      productName,
      productValue,
      productParcelamento,
      productButton
    );
    container.append(productCard);
  });
}
function filterBySize(products: Product[]) {
  Array.from(document.getElementsByClassName("size-filter")).forEach((elem) => {
    elem.addEventListener("click", (e: any) => {
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
      elem.addEventListener("click", (e: any) => {
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
      elem.addEventListener("click", (e: any) => {
        if (
          e.target.name == "price-filter" ||
          e.target.name == "price-filter2"
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
  renderProducts(filteredProducts);
}

function openModals() {
  document.querySelector(".mobile").addEventListener("click", (e: any) => {
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
  const closeFilterModal = document.querySelector(
    ".close-filter-modal"
  ) as HTMLElement;
  closeFilterModal.addEventListener("click", (e) => {
    const modal: HTMLElement = document.getElementsByClassName(
      "modal-filter"
    )[0] as HTMLElement;
    modal.style.display = "none";
  });
  const closeOrderModal = document.querySelector(
    ".close-order-modal"
  ) as HTMLElement;
  closeOrderModal.addEventListener("click", (e) => {
    const modal: HTMLElement = document.getElementsByClassName(
      "modal-order"
    )[0] as HTMLElement;
    modal.style.display = "none";
  });
}

async function main() {
  const { data: products }: IResponse = await api.get("/products");
  renderProducts(products);
  filterBySize(products);
  filterByColor(products);
  filterByPrice(products);
  openModals();
}

document.addEventListener("DOMContentLoaded", main);
