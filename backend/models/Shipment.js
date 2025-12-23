const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shipment = sequelize.define(
    'Shipment',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Orders',
                key: 'id'
            }
        },
        shipperId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'),
            defaultValue: 'assigned',
        },
        pickupTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deliveryTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancelReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Shipment;
