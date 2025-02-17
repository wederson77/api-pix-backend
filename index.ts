import { createServer } from "http";
import { randomUUID } from "crypto";
import Gerencianet from "gn-api-sdk-typescript";
import options from "./credentials";

const gerencianet = new Gerencianet(options);
const PORT = process.env.PORT || 9000;

function criarCobrancaImediata(devedor: { cpf: string; nome: string }, valor: string) {
    return new Promise((resolve, reject) => {
        const txid = randomUUID();

        const params = { txid };

        const body = {
            calendario: { expiracao: 3600 },
            devedor: { cpf: devedor.cpf, nome: devedor.nome },
            valor: { original: parseFloat(valor).toFixed(2).toString() }, // Garantindo string no formato correto
            chave: "fa098649-7915-4b46-a25f-aebfd9bc2f64",
            solicitacaoPagador: "Cobrança dos serviços prestados."
        };

        gerencianet.pixCreateImmediateCharge(params, body)
            .then((res: any) => gerarQrCode(res.loc.id).then((qrCode: any) => {
                // Agora, retornamos tanto o QR Code quanto o campo pixCopiaECola
                resolve({
                    qrCode: qrCode, // URL ou base64 do QR Code
                    pixCopiaECola: res.pixCopiaECola // Código Copia e Cola
                });
            }))
            .catch((erro: any) => reject(erro));
    });
}

function gerarQrCode(locId: number) {
    return new Promise((resolve, reject) => {
        const params = { id: locId };

        gerencianet.pixGenerateQRCode(params)
            .then((res: any) => resolve(res.imagemQrcode)) // Gera o QR Code
            .catch((erro: any) => reject(erro));
    });
}

// Criar servidor HTTP
const server = createServer((req, res) => {
    // Adiciona cabeçalhos CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Responde a requisições OPTIONS (preflight do CORS)
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "https://api-pix-backend.onrender/cobranca") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", async () => {
            try {
                const { nome, cpf, valor } = JSON.parse(body);
                const cobranca = await criarCobrancaImediata({ cpf, nome }, valor);

                // Retorna a resposta com qrCode e pixCopiaECola
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(cobranca)); // Passa ambos os dados (qrCode e pixCopiaECola)
            } catch (erro) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ erro: "Erro ao gerar cobrança." }));
                console.error("Erro no servidor:", erro);
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "Rota não encontrada" }));
    }
});

// Iniciar servidor na porta 9000
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));


// import { createServer } from "http";
// import { randomUUID } from "crypto";
// import Gerencianet from "gn-api-sdk-typescript";
// import options from "./credentials";

// const gerencianet = new Gerencianet(options);

// function criarCobrancaImediata(devedor: { cpf: string; nome: string }, valor: string) {
//     return new Promise((resolve, reject) => {
//         const txid = randomUUID();

//         const params = { txid };

//         const body = {
//             calendario: { expiracao: 3600 },
//             devedor: { cpf: devedor.cpf, nome: devedor.nome },
//             valor: { original: parseFloat(valor).toFixed(2).toString() }, // Garantindo string no formato correto
//             chave: "fa098649-7915-4b46-a25f-aebfd9bc2f64",
//             solicitacaoPagador: "Cobrança dos serviços prestados."
//           };
          

//         gerencianet.pixCreateImmediateCharge(params, body)
//             .then((res: any) => gerarQrCode(res.loc.id))
//             .then((qrCode: any) => resolve(qrCode))
//             .catch((erro: any) => reject(erro));
//     });
// }

// function gerarQrCode(locId: number) {
//     return new Promise((resolve, reject) => {
//         const params = { id: locId };

//         gerencianet.pixGenerateQRCode(params)
//             .then((res: any) => resolve(res.imagemQrcode))
//             .catch((erro: any) => reject(erro));
//     });
// }

// // Criar servidor HTTP
// const server = createServer((req, res) => {
//     // Adiciona cabeçalhos CORS
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//     // Responde a requisições OPTIONS (preflight do CORS)
//     if (req.method === "OPTIONS") {
//         res.writeHead(204);
//         res.end();
//         return;
//     }

//     if (req.method === "POST" && req.url === "/cobranca") {
//         let body = "";

//         req.on("data", chunk => {
//             body += chunk.toString();
//         });

//         req.on("end", async () => {
//             try {
//                 const { nome, cpf, valor } = JSON.parse(body);
//                 const qrCode = await criarCobrancaImediata({ cpf, nome }, valor);

//                 res.writeHead(200, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ qrCode }));
//             } catch (erro) {
//                 res.writeHead(500, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ erro: "Erro ao gerar cobrança." }));
//                 console.error("Erro no servidor:", erro);
//             }
//         });
//     } else {
//         res.writeHead(404, { "Content-Type": "application/json" });
//         res.end(JSON.stringify({ erro: "Rota não encontrada" }));
//     }
// });

// // Iniciar servidor na porta 9000
// server.listen(9000, () => console.log("Servidor rodando na porta 9000 🚀"));






// import { createServer } from "http";
// import { randomUUID } from "crypto";
// import Gerencianet from "gn-api-sdk-typescript";
// import options from "./credentials";

// const gerencianet = new Gerencianet(options);

// function criarCobrancaImediata(devedor: { cpf: string; nome: string }, valor: string) {
//     return new Promise((resolve, reject) => {
//         const txid = randomUUID();

//         const params = { txid };

//         const body = {
//             calendario: { expiracao: 3600 },
//             devedor: { cpf: devedor.cpf, nome: devedor.nome },
//             valor: { original: valor },
//             chave: "fa098649-7915-4b46-a25f-aebfd9bc2f64",
//             solicitacaoPagador: "Cobrança dos serviços prestados."
//         };

//         gerencianet.pixCreateImmediateCharge(params, body)
//             .then((res: any) => gerarQrCode(res.loc.id))
//             .then((qrCode: any) => resolve(qrCode))
//             .catch((erro: any) => reject(erro));
//     });
// }

// function gerarQrCode(locId: number) {
//     return new Promise((resolve, reject) => {
//         const params = { id: locId };

//         gerencianet.pixGenerateQRCode(params)
//             .then((res: any) => resolve(res.imagemQrcode))
//             .catch((erro: any) => reject(erro));
//     });
// }

// // Criar servidor HTTP
// const server = createServer((req, res) => {
//     if (req.method === "POST" && req.url === "/cobranca") {
//         let body = "";

//         req.on("data", chunk => {
//             body += chunk.toString();
//         });

//         req.on("end", async () => {
//             try {
//                 const { nome, cpf, valor } = JSON.parse(body);
//                 const qrCode = await criarCobrancaImediata({ cpf, nome }, valor);

//                 res.writeHead(200, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ qrCode }));
//             } catch (erro) {
//                 res.writeHead(500, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ erro: "Erro ao gerar cobrança." }));
//                 console.error("Erro no servidor:", erro);
//             }
//         });
//     } else {
//         res.writeHead(404, { "Content-Type": "application/json" });
//         res.end(JSON.stringify({ erro: "Rota não encontrada" }));
//     }
// });

// // Iniciar servidor na porta 9000
// server.listen(9000, () => console.log("Servidor rodando na porta 9000 🚀"));



// import Gerencianet from "gn-api-sdk-typescript";
// import options from './credentials';

// const gerencianet = new Gerencianet(options);

// function criarChaveAleatoria() {
//     gerencianet.pixCreateEvp().then((resposta: any) => {
//         console.log(resposta);
//     });
// }

// function criarCobrancaImediata(devedor: { cpf: string, nome: string }, valor: string) {
//     const txid = crypto.randomUUID(); // Gera um txid único

//     const params = {
//         txid: txid
//     };

//     const body = {
//         "calendario": {
//             "expiracao": 3600
//         },
//         "devedor": {
//             "cpf": devedor.cpf,
//             "nome": devedor.nome
//         },
//         "valor": {
//             "original": valor
//         },
//         "chave": "fa098649-7915-4b46-a25f-aebfd9bc2f64",
//         "solicitacaoPagador": "Cobrança dos serviços prestados."
//     };

//     gerencianet.pixCreateImmediateCharge(params, body).then((resposta: any) => {
//         gerarQrCode(resposta.loc.id);
//     }).catch((erro: any) => {
//         console.error("Erro ao criar cobrança:", erro);
//     });
// }

// function gerarQrCode(locId: number) {
//     const params = {
//         id: locId
//     };

//     gerencianet.pixGenerateQRCode(params).then((resposta: any) => {
//         console.log(resposta);
//     }).catch((erro: any) => {
//         console.error("Erro ao gerar QR Code:", erro);
//     });
// }

// // Exemplo de chamada da função com dados do frontend
// criarCobrancaImediata(
//     { cpf: "08155987507", nome: "Francisco da Silva" },
//     "123.45"
// );










// import Gerencianet from "gn-api-sdk-typescript";
// import options from './credentials';

// const gerencianet = new Gerencianet(options);


// function criarChaveAleatoria(){
//     gerencianet.pixCreateEvp().then((resposta: any) => {
//         console.log(resposta);
//     });
// }

// function criarCrobrancaImediata(txid: string){
//     const params = {
//         txid: txid
//     }

//     const body = {
//         "calendario": {
//             "expiracao": 3600
//           },
//         "devedor": {
//             "cpf": "08155987507",
//             "nome": "Francisco da Silva"
//           },
//           "valor": {
//             "original": "123.45"
//           },
//         "chave": "fa098649-7915-4b46-a25f-aebfd9bc2f64",
//         "solicitacaoPagador": "Cobrança dos serviços prestados."
//     };    

//     gerencianet.pixCreateImmediateCharge(params, body).then((resposta: any)=>{
//         // console.log(resposta);
//         gerarQrCode(resposta.loc.id);
//     })
    
// }

// function gerarQrCode(locId: number){
//     const params = {
//         id:     locId
//     }

//     gerencianet.pixGenerateQRCode(params).then((resposta: any)=> {
//         console.log(resposta)
//     })
// }

// // criarChaveAleatoria();
// criarCrobrancaImediata('754de67d-593c-4309-a66f-6873cb05cc7b')
