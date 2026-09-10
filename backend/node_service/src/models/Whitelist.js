import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Whitelist = sequelize.define('Whitelist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    brand_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // 'whitelist' or 'blacklist'
        defaultValue: 'whitelist'
    }
}, {
    tableName: 'whitelists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Whitelist;
