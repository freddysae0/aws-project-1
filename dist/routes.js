"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("./controllers");
const router = (0, express_1.Router)();
router.get('/shifts', controllers_1.getAll);
router.post('/shift', controllers_1.post);
exports.default = router;
