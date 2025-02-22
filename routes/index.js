const testingRouter = require("./testing.route");
const userRouter = require("./user.route");
const authRouter = require("./auth.route");

const routes = (app) => {
    app.use("/", testingRouter)
    app.use("/auth", authRouter)
    app.use("/user", userRouter)
}

module.exports = routes