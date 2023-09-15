const { SqliteDatabase, DataTypes } = require("./sqlite-database");

const DATABASE = 'session.sqlite'
const TABLE = 'sessions';

class SessionManager {
    constructor() {
        this.db = new SqliteDatabase(DATABASE);
        this.table = TABLE;
    }

    async init() {
        this.db.open();
        await this.db.createTableIfNotExists(this.table, [
            { name: 'id', type: DataTypes.INTEGER, primary: true, autoIncr: true },
            { name: 'name', type: DataTypes.TEXT, notNull: true },
            { name: 'date', type: DataTypes.TEXT, notNull: true },
            { name: 'instructor', type: DataTypes.INTEGER, notNull: true },
            { name: 'duration', type: DataTypes.INTEGER },
        ]);
    }

    deinit() {
        this.db.close();
    }

    async getSessions() {
        const sessions = (await this.db.getValues(this.table));
        return sessions;
    }

    async getSession(sessionId) {
        const sessions = (await this.db.getValues(this.table, { id: sessionId }));
        return sessions.length ? sessions[0] : null;
    }

    async addSession(session) {
        delete session.id;
        return (await this.db.insertValue(this.table, session));
    }
}

module.exports = {
    SessionManager
}