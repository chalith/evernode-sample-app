const HotPocket = require("hotpocket-nodejs-contract");
const { SessionManager } = require("./session-manager");

const contract = async (ctx) => {
    const sessionMgr = new SessionManager();
    await sessionMgr.init();

    for (const user of ctx.users.list()) {
        // Loop through inputs sent by the user.
        for (const input of user.inputs) {
            const buffer = await ctx.users.read(input);
            const request = JSON.parse(buffer);

            const type = request.type;
            const content = request.content;
            let response = {
                reqId: request.id,
                type: type,
                status: 'success',
                content: null
            }

            try {
                // State writes are not allowed in readonly mode.
                if (ctx.readonly && type === 'add')
                    throw 'InvalidInputMode';

                switch (type) {
                    case 'add':
                        response.content = await sessionMgr.addSession(content);;
                        break;
                    case 'list':
                        response.content = await sessionMgr.getSessions();
                        break;
                    case 'get':
                        response.content = await sessionMgr.getSession(content.id);
                        break;
                    default:
                        response.status = 'fail';
                        response.content = 'UnhandledRequest';
                        break;
                }
            }
            catch (e) {
                response.status = 'error';
                response.content = e || 'InternalError';
            }

            await user.send(response);
        }
    }

    sessionMgr.deinit();
}

const hpc = new HotPocket.Contract();
hpc.init(contract);