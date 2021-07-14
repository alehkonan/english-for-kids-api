"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var words_1 = require("./data/words");
var config_1 = require("./config");
var app = express_1.default();
app.get('/words', function (req, res) {
    console.log(req.originalUrl);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    res.send(JSON.stringify(words_1.words));
});
app.get('/categories', function (req, res) {
    res.send(JSON.stringify(Object.keys(words_1.words)));
});
app.get('/category/:category', function (req, res, next) {
    var params = req.params;
    var category = params.category;
    res.send(JSON.stringify(words_1.words[category]));
});
app.listen(config_1.SERVER_PORT, function () {
    console.log("App listenning at http://localhost:" + config_1.SERVER_PORT);
});
//# sourceMappingURL=index.js.map