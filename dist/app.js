import express from 'express';
import { UsuarioRouter } from './usuario/usuario.routes.js';
const app = express();
app.use(express.json());
app.use('/api/Usuarios', UsuarioRouter);
app.use((_, res, __) => {
    res.status(404).send({ message: 'Resource not found' });
});
app.listen(5500, () => {
    console.log('Server runnning on http://localhost:5500/');
});
//# sourceMappingURL=app.js.map