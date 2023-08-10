"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const product_1 = __importDefault(require("./routes/product"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'images')));
app.use(express_1.default.json());
app.use("/api/product", product_1.default);
function Run() {
    const PORT = process.env.PORT || 9000;
    mongoose_1.default.connect(process.env.MONGO_GLOBAL_URI)
        .then((res) => console.log('Mongo DB connect in product service'))
        .catch((err) => console.log(`Mongo DB could not connected in auth service, because ${err}`));
    app.listen(PORT, () => {
        console.log(`product server running on port ${PORT}`);
    });
}
Run();
//# sourceMappingURL=index.js.map