export = {
    sandbox: process.env.SANDBOX === "true",
    client_id: process.env.CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    pix_cert: "/etc/secrets/producao-680475-SDK-TS.p12",
};
