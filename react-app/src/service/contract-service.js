const nodeIp = process.env.REACT_APP_CONTRACT_NODE_IP;
const nodePort = process.env.REACT_APP_CONTRACT_NODE_PORT;
const HotPocket = window.HotPocket;

export default class ContractService {
    // Provide singleton instance
    static instance = ContractService.instance || new ContractService();

    userKeyPair = null;
    client = null;
    isConnectionSucceeded = false;
    server = `wss://${nodeIp}:${nodePort}`

    isInitCalled = false;

    promiseMap = new Map();

    async init() {

        if (this.userKeyPair == null) {
            this.userKeyPair = await HotPocket.generateKeys();
        }
        if (this.client == null) {
            this.client = await HotPocket.createClient([this.server], this.userKeyPair);
        }
        console.log("Initialized")

        // This will get fired if HP server disconnects unexpectedly.
        this.client.on(HotPocket.events.disconnect, () => {
            console.log('Disconnected');
            this.isConnectionSucceeded = false;
        })

        // This will get fired as servers connects/disconnects.
        this.client.on(HotPocket.events.connectionChange, (server, action) => {
            console.log(server + " " + action);
        })

        // This will get fired when contract sends outputs.
        this.client.on(HotPocket.events.contractOutput, (r) => {
            r.outputs.forEach(o => {
                console.log(o)
                const pId = o.reqId;
                if (o.status === 'success')
                    this.promiseMap.get(pId)?.resolver(o.content);
                else
                    this.promiseMap.get(pId)?.rejecter(o.content);

                this.promiseMap.delete(pId);
            });
        });

        this.client.on(HotPocket.events.healthEvent, (ev) => {
            console.log(ev);
        });

        if (!this.isConnectionSucceeded) {
            if (!await this.client.connect()) {
                console.log('Connection failed.');
                return false;
            }
            console.log('HotPocket Connected.');
            this.isConnectionSucceeded = true;
        }

        this.isInitCalled = true;

        return true;
    }

    submitInputToContract(inp) {
        let resolver, rejecter;
        const promiseId = this.#getUniqueId();
        const inpString = JSON.stringify({ id: promiseId, ...inp })

        this.client.submitContractInput(inpString).then(input => {
            // console.log(input.hash);
            input?.submissionStatus.then(s => {
                if (s.status !== "accepted")
                    throw Error(`Ledger_Rejection: ${s.reason}`);
            });
        });

        return new Promise((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
            this.promiseMap.set(promiseId, { resolver: resolver, rejecter: rejecter });
        });
    }

    #getUniqueId() {
        const typedArray = new Uint8Array(10);
        const randomValues = window.crypto.getRandomValues(typedArray);
        return randomValues.map(x => x.toString(16).padStart(2, '0')).join('');
    }

    async submitReadRequest(inp) {
        const inpString = JSON.stringify(inp);

        const output = await this.client.submitContractReadRequest(inpString);
        if (output.status === 'success')
            return output.content;

        throw Error(output.content);
    }

}
