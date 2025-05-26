const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/sequelize");

//! Employee Model
const employeeModel=sequelize.define('employees', {
    emp_no:{
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    birth_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    first_name:{
        type: DataTypes.STRING(14),
        allowNull: false
    },
    last_name:{
        type: DataTypes.STRING(16),
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('M', 'F'),
        allowNull: false
    },
    hire_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

//! Department Model
const departmentModel=sequelize.define('departments', {
    dept_no: {
        type: DataTypes.STRING(4),
        primaryKey: true
    },
    dept_name: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});

//! Department Manager Model
const departmentManagerModel=sequelize.define('dept_manager', {
    emp_no: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    dept_no: {
        type: DataTypes.STRING(4),
        primaryKey: true
    },
    from_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    to_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
}); 

//! Department Employee Model
const departmentEmployeeModel=sequelize.define('dept_emp', {
    emp_no: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    dept_no: {
        type: DataTypes.STRING(4),
        primaryKey: true
    },
    from_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    to_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
}); 

//! Titles Model
const titleModel=sequelize.define('titles', {
    emp_no: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    from_date: {
        type: DataTypes.DATE,
        primaryKey: true
    },
    to_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

//! Salary Model
const salaryModel=sequelize.define('salaries', {
    emp_no: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    salary: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    from_date: {
        type: DataTypes.DATE,
        primaryKey: true
    },
    to_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports={employeeModel, departmentModel, departmentEmployeeModel, departmentManagerModel, titleModel, salaryModel};