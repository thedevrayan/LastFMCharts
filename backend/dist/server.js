"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const playlistRoutes_1 = __importDefault(require("./routes/playlistRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', playlistRoutes_1.default);
mongoose_1.default.connect("mongodb+srv://lastfmUser:Lastfm123!@cluster0.oeizf0j.mongodb.net/lastfmDB?retryWrites=true&w=majority")
    .then(() => {
    console.log('✅ MongoDB Atlas conectado!');
    app.listen(3000, '0.0.0.0', () => console.log('Servidor rodando em http://0.0.0.0:3000'));
})
    .catch(err => console.error('❌ Erro ao conectar no MongoDB Atlas:', err));
