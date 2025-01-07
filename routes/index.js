const testingRouter = require("./testing.route");

const routes = (app) => {
    app.use("/", testingRouter)
}

module.exports = routes