const userService = require("../services/user.service.js");
const responser = require("../core/responser.js");
const logger = require("../utility/log.js");

class UserController {
    // Get for authentication
    async getForAuthentication(req, res) {
        const reqQuery = req.query;
        const data = await userService.getForAuthentication(reqQuery);
        logger.info(data);
        return responser.send(200, `Successfully Authentication Fetched`, req, res, data);
    }

    // Get all bidders or auctioneers
    async getAllBidderOrAuctioneer(req, res) {
        const reqQuery = req.query;
        const data = await userService.getAllBidderOrAuctioneer(reqQuery);
        logger.info(data);
        return responser.send(200, `Successfully All ${reqQuery.account} Fetched`, req, res, data);
    }

    // Get single bidder or auctioneer
    async getSingleBidderOrAuctioneer(req, res) {
        const reqParams = req.params;
        const data = await userService.getSingleBidderOrAuctioneer(reqParams);
        logger.info(data);
        return responser.send(200, `Successfully Single ${data.accountType} Fetched`, req, res, data);
    }

    // Update account
    async updateAccount(req, res) {
        const reqData = req.body;
        reqData.userId = req.userId;
        const data = await userService.updateAccount(reqData);
        logger.info(data);
        return responser.send(200, `Successfully ${data.accountType} Account Updated`, req, res, data);
    }

    // Delete bidder or auctioneer
    async deleteBidderOrAuctioneer(req, res) {
        const logInUserId = req.userId;
        const data = await userService.deleteBidderOrAuctioneer(logInUserId);
        logger.info(data);
        return responser.send(200, `Successfully ${data.accountType} Account Deleted`, req, res, data);
    }
}

module.exports = new UserController();
