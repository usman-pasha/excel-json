const excelRouter = require("./excel.route");
const userRouter = require("./user.route");
const authRouter = require("./auth.route");

const routes = (app) => {
    app.use("/auth", authRouter)
    app.use("/user", userRouter)
    app.use("/excel", excelRouter)
}

module.exports = routes