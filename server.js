"use strict";

const Hapi = require("@hapi/hapi");
const { main } = require("./config/dbconfig");
const {
  departmentModel,
  departmentManagerModel,
  employeeModel,
  titleModel,
  departmentEmployeeModel,
  salaryModel,
} = require("./models/models");
const { sequelize } = require("./config/sequelize");
const { Op } = require("sequelize");
require("dotenv").config();

async function init() {
  const server = Hapi.server({
    host: process.env.HOSTNAME,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });
  try {
    await server.start();
    console.log("Server started at ", server.info.uri);
    await main();
    server.route([
      {
        method: "GET",
        path: "/department",
        handler: async (req, h) => {
          //Display list of departments and their last manager
          try {
            const getInfo = await departmentManagerModel.findAll({
              attributes: [
                "dept_no",
                [sequelize.fn("MAX", sequelize.col("from_date")), "from_date"],
              ],
              group: ["dept_no"],
              raw: true,
            });
            const conditions = getInfo.map((items) => ({
              dept_no: items.dept_no,
              from_date: new Date(items.from_date),
            }));
            const result = await departmentManagerModel.findAll({
              where: {
                [Op.or]: conditions,
              },
              include: [
                {
                  model: employeeModel,
                  attributes: ["first_name", "last_name"],
                },
                {
                  model: departmentModel,
                  attributes: ["dept_name"],
                },
              ],
            });
            return result;
          } catch (error) {
            console.log("Error in /department : ", error.message);
          }
        },
      },
      {
        method: "GET",
        path: "/department/{dept}",
        handler: async (req, h) => {
          //display all the managers and their duration in the department
          try {
            const { dept } = req.params;
            const result = await departmentManagerModel.findAll({
              where: {
                dept_no: dept,
              },
              attributes: ["from_date", "to_date"],
              include: [
                {
                  model: departmentModel,
                },
                {
                  model: employeeModel,
                  attributes: ["first_name", "last_name"],
                },
              ],
              // raw: true,
              // nest: true
            });
            return result;
          } catch (error) {
            console.log("Error in /department/{dept} : ", error.message);
          }
        },
      },
      {
        method: "GET",
        path: "/count-employees",
        handler: async (req, h) => {
          const totalRows = await employeeModel.count();
          const totalPages = Math.ceil(totalRows / 100);
          return totalPages;
        },
      },
      {
        method: "GET",
        path: "/employees",
        handler: async (req, h) => {
          try {
            //employee name, dept, last title, last salary
            const { page = 1, limit = 100 } = req.query;
            const limitValue = parseInt(limit);
            const offsetValue = (parseInt(page) - 1) * limitValue;
            const result = await employeeModel.findAll({
              attributes: ["emp_no", "first_name", "last_name"],
              include: [
                {
                  model: titleModel,
                  attributes: ["title", "from_date"],
                  order: [["from_date", "DESC"]],
                },
                {
                  model: salaryModel,
                  attributes: ["salary"],
                  order: [["salary", "DESC"]],
                },
                {
                  model: departmentEmployeeModel,
                  attributes: ["dept_no"],
                  include: {
                    model: departmentModel,
                    attributes: ["dept_name"],
                  },
                },
              ],
              offset: offsetValue,
              limit: limitValue,
            });
            return result;
          } catch (error) {
            console.log("Error in /employees : ", error.message);
          }
        },
      },
      {
        method: "GET",
        path: "/employees/employee/info/{employeenum}",
        handler: async (req, h) => {
          //employee total info, salary history of employee, titles held for a period of time
          try {
            const { employeenum } = req.params;
            const emp_no = parseInt(employeenum);
            const result = await employeeModel.findAll({
              where: {
                emp_no,
              },
            });
            return result;
          } catch (error) {
            console.log("Error in /employees/employee/info : ", error.message);
          }
        },
      },
      {
        method: "GET",
        path: "/employees/employee/salary/{employeenum}",
        handler: async (req, h) => {
          //salary history of employee
          try {
            const { employeenum } = req.params;
            const emp_no = parseInt(employeenum);
            const result = await employeeModel.findAll({
              where: {
                emp_no,
              },
              include: [
                {
                  model: salaryModel,
                  attributes: ["salary", "from_date", "to_date"],
                  order: [["from_date", "ASC"]],
                },
              ],
            });
            return result;
          } catch (error) {
            console.log(
              "Error in /employees/employee/salary : ",
              error.message
            );
          }
        },
      },
      {
        method: "GET",
        path: "/employees/employee/titles/{employeenum}",
        handler: async (req, h) => {
          //titles held for a period of time
          try {
            const { employeenum } = req.params;
            const emp_no = parseInt(employeenum);
            const result = await employeeModel.findAll({
              where: {
                emp_no,
              },
              attributes: ["emp_no"],
              include: [
                {
                  model: titleModel,
                  attributes: ["title", "from_date", "to_date"],
                  order: [["from_date", "ASC"]],
                },
              ],
            });
            return result;
          } catch (error) {
            console.log(
              "Error in /employees/employee/titles : ",
              error.message
            );
          }
        },
      },
      {
        method: "GET",
        path: "/get-departments",
        handler: async (req, h) => {
          try {
            const result = await departmentModel.findAll({
              attributes: ["dept_name"],
            });
            return result;
          } catch (error) {
            console.log("Error in /get-departments : ", error.message);
          }
        },
      },
      {
        method: "GET",
        path: "/employees/query",
        handler: async (req, h) => {
          try {
            const {
              page = 1,
              limit = 100,
              searchValue,
              salaryStart,
              salaryEnd,
              sortField,
              sortBy,
              departments,
              ageMin,
              ageMax,
            } = req.query;

            const limitValue = parseInt(limit);
            const offsetValue = (parseInt(page) - 1) * limitValue;

            let deptSearchList = [];
            if (departments) {
              deptSearchList = departments.split(",");
            }

            const whereConditions = [];

            // Name search filter
            if (searchValue) {
              whereConditions.push({
                [Op.or]: [
                  { first_name: { [Op.like]: `%${searchValue}%` } },
                  { last_name: { [Op.like]: `%${searchValue}%` } },
                ],
              });
            }

            let orderClause = [];

            // Sorting logic
            if (sortField && sortBy) {
              if (sortField === "salary") {
                orderClause.push([{ model: salaryModel }, "salary", sortBy]);
              } else if (sortField === "dept_name") {
                orderClause.push([
                  {
                    model: departmentEmployeeModel,
                    include: [{ model: departmentModel }],
                  },
                  departmentModel,
                  "dept_name",
                  sortBy,
                ]);
              } else {
                orderClause.push([sortField, sortBy]); // for first_name, etc.
              }
            }

            // Age filter logic
            const ageCondition = {};
            if (ageMin != null && ageMax != null) {
              ageCondition[Op.between] = [parseInt(ageMin), parseInt(ageMax)];
            } else if (ageMin != null) {
              ageCondition[Op.gte] = parseInt(ageMin);
            } else if (ageMax != null) {
              ageCondition[Op.lte] = parseInt(ageMax);
            }

            if (Object.keys(ageCondition).length > 0) {
              whereConditions.push(
                where(
                  fn("TIMESTAMPDIFF", literal("YEAR"), col("birth_date"), fn("CURDATE")),
                  ageCondition
                )
              );
            }

            // Salary include config
            let salaryInclude = {
              model: salaryModel,
              attributes: ["salary"],
              order: [["salary", "DESC"]],
            };
            if (salaryStart !== undefined && salaryEnd !== undefined) {
              salaryInclude.where = {
                salary: {
                  [Op.between]: [parseInt(salaryStart), parseInt(salaryEnd)],
                },
              };
            }

            // Department include config
            let departmentInclude = {
              model: departmentEmployeeModel,
              attributes: ["dept_no"],
              include: {
                model: departmentModel,
                attributes: ["dept_name"],
              },
            };
            if (deptSearchList.length > 0) {
              departmentInclude.include.where = {
                dept_name: {
                  [Op.in]: deptSearchList,
                },
              };
            }

            // Final DB query
            const result = await employeeModel.findAll({
              attributes: ["emp_no", "first_name", "last_name", "birth_date"],
              where: {
                [Op.and]: whereConditions,
              },
              include: [
                {
                  model: titleModel,
                  attributes: ["title", "from_date"],
                  order: [["from_date", "DESC"]],
                },
                salaryInclude,
                departmentInclude,
              ],
              offset: offsetValue,
              limit: limitValue,
              // ...(sortField && sortBy ? { order: [[sortField, sortBy]] } : {}),
              order: orderClause,

            });

            // return result;

            //Count the total number of records for the given query
            const totalCount = await employeeModel.count({
              where: {
                [Op.and]: whereConditions,
              },
              include: [
                salaryInclude,
                departmentInclude,
              ],
              distinct: true,
            });
            console.log("Total count: ", totalCount);

            return {
              data: result,
              totalCount
            };
          } catch (error) {
            console.log("Error in /employees/query: ", error.message);
            return h.response({ error: "Internal Server Error" }).code(500);
          }
        },
      }

    ]);
  } catch (error) {
    console.log("OOPS! An error occurred. Error Message: ", error.message);
    process.exit(1);
  }
}
init();
