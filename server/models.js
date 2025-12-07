const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const bcrypt = require('bcrypt');

const Professional = sequelize.define('Professional', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    service_commission_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    },
    product_commission_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true
});

const Service = sequelize.define('Service', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

const Sale = sequelize.define('Sale', {
    professional_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Professionals',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('SERVICE', 'PRODUCT'),
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sale_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    commission_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    client_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    client_origin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tip_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0
    }
});

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'MANAGER', 'RECEPTION'),
        allowNull: false,
        defaultValue: 'RECEPTION'
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Transaction = sequelize.define('Transaction', {
    type: {
        type: DataTypes.ENUM('IN', 'OUT'),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'COMPLETED'
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    professional_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Professionals',
            key: 'id'
        }
    },
    deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    paranoid: true // Enable Soft Deletes (deletedAt)
});

const VaultTransaction = sequelize.define('VaultTransaction', {
    type: {
        type: DataTypes.ENUM('DEPOSIT', 'WITHDRAW'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING, // e.g., 'IVA', 'Reserva', 'Impostos'
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Relationships
Professional.hasMany(Sale, { foreignKey: 'professional_id' });
Sale.belongsTo(Professional, { foreignKey: 'professional_id' });
Sale.belongsTo(Service, { foreignKey: 'item_id', constraints: false });
Sale.belongsTo(Product, { foreignKey: 'item_id', constraints: false });
Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Professional, { foreignKey: 'professional_id' });
Professional.hasMany(Transaction, { foreignKey: 'professional_id' });

module.exports = {
    sequelize,
    Professional,
    Service,
    Product,
    Sale,
    User,
    Transaction,
    VaultTransaction
};
