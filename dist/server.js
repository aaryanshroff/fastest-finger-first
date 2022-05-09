/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/server/server.ts":
/*!******************************!*\
  !*** ./src/server/server.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar express = __webpack_require__(/*! express */ \"express\");\nvar path = __webpack_require__(/*! path */ \"path\");\nvar http = __webpack_require__(/*! http */ \"http\");\nvar uuid_1 = __webpack_require__(/*! uuid */ \"uuid\");\nvar socket_io_1 = __webpack_require__(/*! socket.io */ \"socket.io\");\nvar app = express();\nvar server = http.createServer(app);\nvar port = process.env.PORT || 4001;\nvar io = new socket_io_1.Server(server);\nvar rooms = {};\nvar randomLetter = function () {\n    var letters = \"ABCDEFGHIKLMNOPQRSTUVWXY\";\n    return letters.charAt(Math.random() * letters.length);\n};\nio.on(\"connection\", function (socket) {\n    // WebRTC relay functions\n    // [ Emit received data to other participants in the room ]\n    socket.on(\"create or join\", function (roomID) {\n        console.log(\"\".concat(socket.id, \" wants to create or join room \").concat(roomID));\n        var room = io.of(\"/\").adapter.rooms.get(roomID);\n        // Allow no more than 2 people in a room\n        if (room && room.size === 2) {\n            socket.emit(\"error\", {\n                message: \"Room is full\",\n            });\n            return;\n        }\n        socket.join(roomID);\n        socket.to(roomID).emit(\"other user\");\n    });\n    socket.on(\"offer\", function (data) {\n        console.log(\"\".concat(socket.id, \" is making an offer to their room\"));\n        socket.to(data.roomID).emit(\"offer\", data);\n    });\n    socket.on(\"answer\", function (data) {\n        console.log(\"\".concat(socket.id, \" is answering their offer\"));\n        socket.to(data.roomID).emit(\"answer\", data);\n    });\n    socket.on(\"ice candidate\", function (data) {\n        socket.to(data.roomID).emit(\"ice candidate\", data);\n    });\n    // Game functions\n    socket.on(\"correct answer\", function (roomID) {\n        console.log(\"\".concat(socket.id, \" answered corrected\"));\n        io.to(roomID).emit(\"new prompt\", {\n            letter: randomLetter(),\n            answerer: socket.id,\n        });\n    });\n    socket.on(\"ready\", function (roomID) {\n        io.to(roomID).emit(\"new prompt\", {\n            letter: randomLetter(),\n            answerer: \"\",\n        });\n    });\n});\nvar router = express.Router();\nrouter.get(\"/:room\", function (req, res) {\n    res.sendFile(path.join(__dirname, \"../public/index.html\"), function (err) {\n        if (err) {\n            res.status(500).send(err);\n        }\n    });\n});\n// Redirect all GET requests to / to a random room\nrouter.get(\"/\", function (req, res) {\n    var room = (0, uuid_1.v4)();\n    res.redirect(\"/\".concat(room));\n});\napp.use(\"/\", router);\napp.use(express.static(\"public\"));\nserver.listen(port, function () { return console.log(\"Server listening on port \".concat(port)); });\n\n\n//# sourceURL=webpack://fastest-finger-first/./src/server/server.ts?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/server/server.ts");
/******/ 	
/******/ })()
;