import { readFile } from "node:fs/promises";
import path from "node:path";

const urlFile = path.resolve(".paperkg/cloudflare/oauth-smoke-url.txt");
const authorizationUrl = (await readFile(urlFile, "utf8")).trim();

const consentResponse = await fetch(authorizationUrl, { redirect: "manual" });
const consentHtml = await consentResponse.text();
const setCookie = consentResponse.headers.get("set-cookie") ?? "";
const cookie = setCookie.split(";")[0];
const consentId = consentHtml.match(/name="consent_id" value="([^"]+)"/)?.[1];
const csrfToken = consentHtml.match(/name="csrf_token" value="([^"]+)"/)?.[1];

if (!consentResponse.ok || !cookie || !consentId || !csrfToken) {
  throw new Error(`Consent GET failed: status=${consentResponse.status}, form=${Boolean(consentId && csrfToken)}, cookie=${Boolean(cookie)}`);
}

const postResponse = await fetch(new URL("/authorize", authorizationUrl), {
  method: "POST",
  redirect: "manual",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    cookie,
  },
  body: new URLSearchParams({ consent_id: consentId, csrf_token: csrfToken }),
});
const location = postResponse.headers.get("location");
const responseBody = await postResponse.text();
const htmlLocation = responseBody.match(/<a href="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
const destination = new URL(location ?? htmlLocation);

console.log(JSON.stringify({
  consentGetStatus: consentResponse.status,
  consentGetBuild: consentResponse.headers.get("x-paperkg-auth-build"),
  consentPostStatus: postResponse.status,
  consentPostBuild: postResponse.headers.get("x-paperkg-auth-build"),
  redirectHost: destination?.host ?? null,
  redirectPath: destination?.pathname ?? null,
  hasClientId: Boolean(destination?.searchParams.get("client_id")),
  hasState: Boolean(destination?.searchParams.get("state")),
  hasFallbackLink: Boolean(htmlLocation),
}, null, 2));
