import Server from "./rest/Server";

export class App {
    // Initializes and starts the server
    public initServer(port: number) {
        const server = new Server(port);
        return server.start().then(() => {
            console.log("Server successfully started");
        }).catch((err: any) => {
            return Promise.reject(new Error("Server initialization error: " + err.message));
        });
    }
}

// This starts the whole system and listens on a port (6666)
console.log("Server initializing:");
const app = new App();
(async () => {
    await app.initServer(3500);
})();