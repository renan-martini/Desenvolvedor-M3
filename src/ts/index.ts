import { Product } from "./Product";
import axios from "axios";

const serverUrl = "http://localhost:5000";

const api = axios.create({
  baseURL: serverUrl,
});

interface IResponse {
  data: Product[];
}

async function main() {
  const { data: products }: IResponse = await api.get("/products");
  console.log(products);
}

document.addEventListener("DOMContentLoaded", main);
