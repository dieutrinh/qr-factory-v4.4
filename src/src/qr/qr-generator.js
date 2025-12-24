function assertPublicBaseUrl(publicBaseUrl) {
  if (!publicBaseUrl) throw new Error("publicBaseUrl is empty");
  const s = String(publicBaseUrl).trim();
  if (s.includes("127.0.0.1") || s.includes("localhost")) {
    throw new Error("publicBaseUrl must not be 127.0.0.1/localhost");
  }
  return s.replace(/\/+$/, "");
}

function buildLoginUrl({ token, publicBaseUrl }) {
  const base = assertPublicBaseUrl(publicBaseUrl);
  return `${base}/login?token=${encodeURIComponent(token)}`;
}

function buildLogoutUrl({ token, publicBaseUrl }) {
  const base = assertPublicBaseUrl(publicBaseUrl);
  return `${base}/logout?token=${encodeURIComponent(token)}`;
}

module.exports = { assertPublicBaseUrl, buildLoginUrl, buildLogoutUrl };
