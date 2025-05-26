const { employeeModel, departmentManagerModel, departmentEmployeeModel, titleModel, salaryModel, departmentModel } = require("./models");

//! Employee association
employeeModel.hasOne(departmentManagerModel, {foreignKey: 'emp_no', onDelete: 'CASCADE'});
employeeModel.hasOne(departmentEmployeeModel, {foreignKey: 'emp_no', onDelete: 'CASCADE'});
employeeModel.hasMany(titleModel, {foreignKey: 'emp_no', onDelete: 'CASCADE'});
employeeModel.hasMany(salaryModel, {foreignKey: 'emp_no', onDelete: 'CASCADE'});

//! Department association
departmentModel.hasMany(departmentEmployeeModel, {foreignKey: 'dept_no', onDelete: 'CASCADE'});
departmentModel.hasMany(departmentManagerModel, {foreignKey: 'dept_no', onDelete: 'CASCADE'});

//! Title Association
titleModel.belongsTo(employeeModel, {foreignKey: 'emp_no'});

//! Salary association
salaryModel.belongsTo(employeeModel, {foreignKey: 'emp_no'});

//! Department employee association
departmentEmployeeModel.belongsTo(employeeModel, {foreignKey: 'emp_no'});
departmentEmployeeModel.belongsTo(departmentModel, {foreignKey: 'dept_no'});

//! Department manager association
departmentManagerModel.belongsTo(employeeModel, {foreignKey: 'emp_no'});
departmentManagerModel.belongsTo(departmentModel, {foreignKey: 'dept_no'});