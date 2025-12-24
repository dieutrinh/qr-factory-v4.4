\
function assertPublicBaseUrl(publicBaseUrl){
  if(!publicBaseUrl) throw new Error("publicBaseUrl is empty");
  const s=String(publicBaseUrl).trim();
  if(s.includes("127.0.0.1")||s.includes("localhost")){
    throw new Error("publicBaseUrl must not be 127.0.0.1/localhost");
  }
  return s.replace(/\/+$/,"");
}
module.exports = { assertPublicBaseUrl };
