import createClient from "openapi-fetch";
import type { paths } from "./schema";

const client = createClient<paths>({ baseUrl: "https://api.opendota.com/api" });
export default client;